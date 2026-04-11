
const SUPABASE_URL = 'https://wvcqggwkyfwjjpizzyko.supabase.co'; 


const SUPABASE_KEY = 'sb_publishable_DF7EO-O0hPqpBUmYJu4t4w_IFftE2hN'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let cart = [];
let menuData = [];


async function loadMenu() {
    try {
        const { data, error } = await _supabase.from('products').select('*');
        if (error) throw error;
        menuData = data;
       
        showCategory('hot', document.querySelector('.nav-item')); 
    } catch (err) {
        console.error("خطأ في الاتصال بقاعدة البيانات:", err.message);
        alert(" ، تأكد من مفتاح الـ API في ملف الـ JS.");
    }
}


function showCategory(cat, element) {
    const container = document.getElementById('products-container');
    container.innerHTML = "";
    

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(element) element.classList.add('active');
    
    const filtered = menuData.filter(p => p.category === cat);
    filtered.forEach(p => {
        
        let optionsHTML = "";
        if (p.sizes) {
            optionsHTML = `<div class="options-row"><select class="glass-select" id="opt-${p.id}">`;
            for (let s in p.sizes) {
             
                optionsHTML += `<option value="${s}">${s}</option>`;
            }
            optionsHTML += `</select></div>`;
        }


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


function addToCart(id) {
    const p = menuData.find(item => item.id === id);
    const selectedOpt = document.getElementById(`opt-${id}`) ? document.getElementById(`opt-${id}`).value : "عادي";

    
    cart.push({
        name: p.name,
        price: p.price,
        details: selectedOpt
    });

    updateCartUI();
    showToast();     
}

      
function showToast() {
    const toast = document.getElementById('order-toast');
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 2500); // يختفي بعد ثانيتين ونصف
}

   
function updateCartUI() {
    const btn = document.getElementById('floating-cart');
    const counter = document.getElementById('cart-counter');
    const content = document.getElementById('sidebar-content');
    
      
    if (cart.length > 0) {
        btn.style.display = "flex";
        counter.innerText = cart.length;
    } else {
        btn.style.display = "none";
    }

        
    content.innerHTML = cart.map((item, index) => `
        <div class="cart-item-row" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${item.name} <small style="color:var(--primary-gold);">(${item.details})</small></span>
            <b>${item.price} ج.م</b>
        </div>
    `).join('');

       
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').innerText = total;
}

  
function toggleCart(show) {
    document.getElementById('cart-sidebar').classList.toggle('active', show);
}

   
function sendOrder() {
    const table = document.getElementById('table-num').value;
    const notes = document.getElementById('order-notes').value;
    
    if(!table) return alert(" ادخل رقم الطاولة!");

    let text = `*طلب جديد من منيو كافيه Elite*%0A*طاولة  رقم:* ${table}%0A%0A`;
    cart.forEach(i => text += `• ${i.name} (${i.details}) -> ${i.price}ج%0A`);
    text += `%0A*الإجمالي :* ${document.getElementById('total-price').innerText} ج.م`;
    if(notes) text += `%0A*ملاحظات :* ${notes}`;


    window.open(`https://wa.me/201123385820?text=${text}`);
}


document.addEventListener("DOMContentLoaded", loadMenu);
