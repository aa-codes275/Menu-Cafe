// 1. إعدادات الاتصال (تأكد من كتابة supabase بالكامل)
const SUPABASE_URL = 'https://wvcqggwkyfwjjpizzyko.supabase.co'; 

// انسخ المفتاح الطويل جداً (anon public) من صفحة الـ API وحطه هنا
const SUPABASE_KEY = 'sb_publishable_DF7EO-O0hPqpBUmYJu4t4w_IFftE2hN'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let cart = [];
let menuData = [];

// 1. تحميل المنيو عند البداية
async function loadMenu() {
    try {
        const { data, error } = await _supabase.from('products').select('*');
        if (error) throw error;
        menuData = data;
        // عرض أول قسم افتراضياً (الساخنة)
        showCategory('hot', document.querySelector('.nav-item')); 
    } catch (err) {
        console.error("خطأ في الاتصال بقاعدة البيانات:", err.message);
        alert("يا فنان، تأكد من مفتاح الـ API في ملف الـ JS.");
    }
}

// 2. دالة عرض المنتجات حسب القسم
function showCategory(cat, element) {
    const container = document.getElementById('products-container');
    container.innerHTML = "";
    
    // تحديث شكل الزراير وتفعيل الزر الحالي
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(element) element.classList.add('active');
    
    const filtered = menuData.filter(p => p.category === cat);
    filtered.forEach(p => {
        // بناء الأوبشنز (من عمود الـ JSON)
        let optionsHTML = "";
        if (p.sizes) {
            optionsHTML = `<div class="options-row"><select class="glass-select" id="opt-${p.id}">`;
            for (let s in p.sizes) {
                // عرض النص فقط بدون سعر
                optionsHTML += `<option value="${s}">${s}</option>`;
            }
            optionsHTML += `</select></div>`;
        }

        // الكارت العريض بتصميمه الجديد
        container.innerHTML += `
            <div class="mini-card">
                <img src="${p.image_url}" onerror="this.src='unnamed.png'">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <span class="price-tag">${p.price} ج.م</span>
                    ${optionsHTML}
                </div>
                <button class="add-btn" onclick="addToCart(${p.id})">أضف +</button>
            </div>`;
    });
}

// 3. إضافة منتج للسلة
function addToCart(id) {
    const p = menuData.find(item => item.id === id);
    const selectedOpt = document.getElementById(`opt-${id}`) ? document.getElementById(`opt-${id}`).value : "عادي";

    // السعر ثابت لا يتغير بالاختيارات
    cart.push({
        name: p.name,
        price: p.price,
        details: selectedOpt
    });

    updateCartUI();
    showToast(); // إظهار رسالة تأكيد فقط
}

// 4. دالة إظهار الـ Toast الذهبي
function showToast() {
    const toast = document.getElementById('order-toast');
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 2500); // يختفي بعد ثانيتين ونصف
}

// 5. تحديث السلة والعداد
function updateCartUI() {
    const btn = document.getElementById('floating-cart');
    const counter = document.getElementById('cart-counter');
    const content = document.getElementById('sidebar-content');
    
    // إظهار السلة لو فيها داتا
    if (cart.length > 0) {
        btn.style.display = "flex";
        counter.innerText = cart.length;
    } else {
        btn.style.display = "none";
    }

    // تحديث محتوى القائمة الجانبية
    content.innerHTML = cart.map((item, index) => `
        <div class="cart-item-row" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${item.name} <small style="color:var(--primary-gold);">(${item.details})</small></span>
            <b>${item.price} ج.م</b>
        </div>
    `).join('');

    // حساب الإجمالي الملكي
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').innerText = total;
}

// 6. فتح وغلق السلة
function toggleCart(show) {
    document.getElementById('cart-sidebar').classList.toggle('active', show);
}

// 7. إرسال الطلب للواتساب
function sendOrder() {
    const table = document.getElementById('table-num').value;
    const notes = document.getElementById('order-notes').value;
    
    if(!table) return alert("  ادخل رقم الطاولة الأول عشان نعرف هنوصلك فين!");

    let text = `*طلب جديد من منيو كافيه Elite*%0A*طاولة  رقم:* ${table}%0A%0A`;
    cart.forEach(i => text += `• ${i.name} (${i.details}) -> ${i.price}ج%0A`);
    text += `%0A*الإجمالي :* ${document.getElementById('total-price').innerText} ج.م`;
    if(notes) text += `%0A*ملاحظات :* ${notes}`;

    // فتح الواتساب (تأكد من الرقم في قاعدة البيانات)
    window.open(`https://wa.me/20101615615?text=${text}`);
}

// تشغيل تحميل البيانات
document.addEventListener("DOMContentLoaded", loadMenu);