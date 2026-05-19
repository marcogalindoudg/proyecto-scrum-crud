// 1. Configuración de Supabase con tus credenciales reales
const SUPABASE_URL = "https://plzymdrhiofuviatanld.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsenltZHJoaW9mdXZpYXRhbmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjUyODEsImV4cCI6MjA5NDYwMTI4MX0.BspbXzwjTuaA6xwZBiWaZetZFpK_yUhxZzOMxxViL5s"; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let productos = []; 
let carrito = [];

// Elementos del DOM
const catalogoEl = document.getElementById('catalogoProductos');
const contadorCarritoEl = document.getElementById('contadorCarrito');
const listaCarritoEl = document.getElementById('listaCarrito');
const totalCarritoEl = document.getElementById('totalCarrito');
const modal = document.getElementById("carritoModal");
const btn = document.getElementById("verCarritoBtn");
const span = document.getElementsByClassName("close-btn")[0];

// 2. CONSULTAR TODOS LOS REGISTROS (READ - Base de Datos)
async function cargarCatalogo() {
    if(!catalogoEl) return;
    catalogoEl.innerHTML = ''; 
    
    // Petición asíncrona real a Supabase
    let { data, error } = await _supabase.from('productos').select('*');
    
    if (error) {
        console.error("Error cargando productos de la BD:", error);
        return;
    }
    
    productos = data; 

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <small style="color: #007bff; font-weight: bold; display: block; margin-bottom: 8px; text-transform: uppercase; font-size: 0.85rem;">ID del Producto: ${producto.id}</small>
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h4>${producto.nombre}</h4>
            <p>$${parseFloat(producto.precio).toFixed(2)}</p>
            <button class="agregar-btn" onclick="agregarAlCarrito(${producto.id})">
                <i class="bi bi-cart-plus"></i> Agregar
            </button>
        `;
        if(catalogoEl) catalogoEl.appendChild(card);
    });
}

// 3. AGREGAR PRODUCTO AL CARRITO (Lógica Frontend)
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
        const itemExistente = carrito.find(item => item.id === productoId);
        
        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        
        actualizarCarrito();
    }
}

// 4. ACTUALIZAR LA INTERFAZ DEL CARRITO
function actualizarCarrito() {
    if(contadorCarritoEl) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contadorCarritoEl.textContent = totalItems;
    }

    if(listaCarritoEl) {
        listaCarritoEl.innerHTML = '';
        let total = 0;

        carrito.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            total += itemTotal;
            
            const li = document.createElement('li');
            li.textContent = `${item.nombre} x ${item.cantidad} - $${itemTotal.toFixed(2)}`;
            listaCarritoEl.appendChild(li);
        });

        if(totalCarritoEl) totalCarritoEl.textContent = total.toFixed(2);
    }
}

// 5. FUNCIONALIDAD DEL MODAL (Apertura y Cierre)
if (btn && modal && span) {
    btn.onclick = function() {
        modal.style.display = "block";
    }
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// ==========================================
// 6. FUNCIONES CRUD COMPLETAS (Para la evaluación)
// Conectadas directamente a los formularios de tu HTML
// ==========================================

// AGREGAR REGISTRO (CREATE)
async function agregarNuevoProducto(nombre, precio, imagen) {
    const { data, error } = await _supabase
      .from('productos')
      .insert([{ nombre, precio, imagen }]);
    
    if (error) {
        console.error("Error al agregar:", error);
        alert("Error al guardar en la base de datos: " + error.message);
    } else {
        cargarCatalogo(); 
    }
}

// EDITAR REGISTRO (UPDATE)
async function editarPrecioProducto(id, nuevoPrecio) {
    const { data, error } = await _supabase
      .from('productos')
      .update({ precio: nuevoPrecio })
      .eq('id', id);
    
    if (error) {
        console.error("Error al editar:", error);
        alert("Error al actualizar en la base de datos: " + error.message);
    } else {
        cargarCatalogo();
    }
}

// ELIMINAR REGISTRO (DELETE)
async function eliminarProducto(id) {
    const { data, error } = await _supabase
      .from('productos')
      .delete()
      .eq('id', id);
    
    if (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar de la base de datos: " + error.message);
    } else {
        cargarCatalogo();
    }
}

// Inicialización del DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    actualizarCarrito();
});
