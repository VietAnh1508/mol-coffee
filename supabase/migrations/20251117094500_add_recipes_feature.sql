-- Recipes feature schema and seed data

-- Create recipes table
CREATE TABLE public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create recipe_steps table
CREATE TABLE public.recipe_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT recipe_steps_step_number_check CHECK (step_number > 0),
    CONSTRAINT recipe_steps_unique_step UNIQUE (recipe_id, step_number)
);

-- Index to speed up detail lookups
CREATE INDEX idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);

-- Reuse updated_at trigger for new tables
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_steps_updated_at BEFORE UPDATE ON public.recipe_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;

-- RLS policies: everyone logged in can read, only admins modify
CREATE POLICY "Authenticated users can read recipes" ON public.recipes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage recipes" ON public.recipes
    FOR ALL USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can read recipe steps" ON public.recipe_steps
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage recipe steps" ON public.recipe_steps
    FOR ALL USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Seed recipe data
INSERT INTO public.recipes (slug, name, description) VALUES
    ('cham-ca-phe', 'Châm cà phê', 'Quy trình châm cà phê'),
    ('pha-tra-da', 'Pha trà đá', 'Chuẩn bị trà đá dùng hàng ngày'),
    ('pha-nuoc-duong', 'Pha nước đường', NULL),
    ('ca-phe-da', 'Cà phê đá', NULL),
    ('ca-phe-sua', 'Cà phê sữa', NULL),
    ('bac-xiu', 'Bạc xỉu', NULL),
    ('ca-phe-sua-tuoi', 'Cà phê sữa tươi', NULL),
    ('cacao', 'Cacao', NULL),
    ('tra-trai-cay', 'Trà trái cây', NULL),
    ('matcha-latte', 'Matcha latte', NULL),
    ('khoai-mon-latte', 'Khoai môn latte', NULL),
    ('cacao-latte', 'Cacao latte', NULL);

INSERT INTO public.recipe_steps (recipe_id, step_number, instruction)
SELECT r.id, step_number, instruction
FROM public.recipes r
JOIN (
    VALUES
        ('cham-ca-phe', 1, 'Cân 130g cà phê vào mỗi phin'),
        ('cham-ca-phe', 2, 'Ủ cà phê trong phin'),
        ('cham-ca-phe', 3, 'Châm 50ml nước nóng vào đĩa'),
        ('cham-ca-phe', 4, 'Châm 100ml nước nóng vào phin'),
        ('cham-ca-phe', 5, 'Ủ phin cà phê trong 30 phút'),
        ('cham-ca-phe', 6, 'Châm 200ml nước nóng lần 1 và đợi chảy hết (15-20 phút)'),
        ('cham-ca-phe', 7, 'Châm tiếp 200ml nước nóng lần 2'),
        ('cham-ca-phe', 8, 'Rót cà phê vào chai, để nguội rồi bảo quản tủ lạnh'),

        ('pha-tra-da', 1, '1 gói trà chia làm 3 lần pha'),
        ('pha-tra-da', 1, 'Cho 1/3 gói trà vào túi lọc'),
        ('pha-tra-da', 2, 'Châm vào bình 2 ấm nước sôi'),

        ('pha-nuoc-duong', 1, 'Cho vào máy xay 1kg đường và 700ml nước nóng'),
        ('pha-nuoc-duong', 2, 'Bật máy ở mức MIN, lưu ý tắt máy sau khi xay xong'),

        ('ca-phe-da', 1, 'Rót 50ml cà phê vào ly'),
        ('ca-phe-da', 2, 'Thêm 10ml đường và khuấy đều'),
        ('ca-phe-da', 3, 'Cho đá vào ly và phục vụ'),

        ('ca-phe-sua', 1, 'Rót 50ml cà phê vào ly'),
        ('ca-phe-sua', 2, 'Thêm 10ml sữa đặc'),
        ('ca-phe-sua', 3, 'Cho đá vào ly sau đó cho cà phê vào sau'),

        ('bac-xiu', 2, 'Cho đá vào ly'),
        ('bac-xiu', 1, 'Đánh đều 30ml sữa đặc với 30ml sữa tươi'),
        ('bac-xiu', 3, 'Đánh bọt 30ml cà phê phin rưới lên trên cùng'),

        ('ca-phe-sua-tuoi', 2, 'Cho đá vào ly'),
        ('ca-phe-sua-tuoi', 1, 'Đánh đều 30ml sữa đặc với 70ml sữa tươi'),
        ('ca-phe-sua-tuoi', 3, 'Đánh bọt 30ml cà phê phin rưới lên trên cùng'),

        ('cacao', 1, 'Cho 8g bột cacao vào ca đong, thêm 50ml nước nóng và đánh tan'),
        ('cacao', 2, 'Cho đá vào ly'),
        ('cacao', 3, 'Đánh đều 30ml sữa đặc với 50ml sữa tươi rồi đổ vào ly'),
        ('cacao', 4, 'Rưới cacao lén trên cùng'),

        ('tra-trai-cay', 1, 'Cho 1 gói trà lipton hoặc trà ô long và 100ml nước nóng vào ly'),
        ('tra-trai-cay', 3, 'Thêm 40ml mứt, 30ml đường và 2 trái tắc'),
        ('tra-trai-cay', 4, 'Khuấy đều trước khi phục vụ'),

        ('matcha-latte', 1, 'Cho 5g bột matcha vào ca đong, thêm 50ml nước nóng và đánh cho tan'),
        ('matcha-latte', 2, 'Cho đá vào ly'),
        ('matcha-latte', 3, 'Đánh đều 40ml sữa đặc với 100ml sữa tươi rồi đổ vào ly'),
        ('matcha-latte', 4, 'Rưới matcha lên trên cùng'),

        ('khoai-mon-latte', 1, 'Cho 20g bột khoai môn vào ca đong, thêm 50ml nước nóng và đánh tan'),
        ('khoai-mon-latte', 2, 'Cho đá vào ly'),
        ('khoai-mon-latte', 3, 'Đánh đều 40ml sữa đặc với 100ml sữa tươi rồi đổ vào ly'),
        ('khoai-mon-latte', 4, 'Rưới khoai môn lên trên cùng'),

        ('cacao-latte', 1, 'Cho 8g bột cacao vào ca đong, thêm 50ml nước nóng và đánh tan'),
        ('cacao-latte', 2, 'Cho đá vào ly'),
        ('cacao-latte', 3, 'Đánh đều 40ml sữa đặc với 100ml sữa tươi rồi đổ vào ly'),
        ('cacao-latte', 4, 'Rưới cacao lên trên cùng')
) AS seed(slug, step_number, instruction)
ON (r.slug = seed.slug);
