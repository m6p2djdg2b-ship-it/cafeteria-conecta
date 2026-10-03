# Cafetería Conecta

Aplicación web sencilla para que los clientes de una cafetería consulten el menú, hagan su pedido y vean el estado del mismo, y para que el encargado actualice ese estado. Es el producto del Taller de Scrum de Ingeniería de Software I (Universidad Simón Bolívar).

## Equipo

| Integrante | Rol |
| --- | --- |
| Aguirre Isaac | Product Owner |
| Álvarez Juan | Scrum Master |
| Barrios Elkin | Developer |
| Lobelo Rafael | Developer |
| Carreño Bryan | Developer |

## Cómo ejecutarla

No necesita instalar nada ni un servidor. Descarga o clona el repositorio y abre `index.html` en el navegador.

```bash
git clone <URL-DEL-REPOSITORIO>
cd cafeteria-conecta
# abrir index.html con doble clic o desde el navegador
```

Para probar el flujo completo:

1. En **Soy cliente**, elige productos con los botones + y −, escribe tu nombre y pulsa *Confirmar pedido*. Anota el número del pedido.
2. Abre la pestaña **Soy encargado** (puede ser en otra pestaña del navegador) y pasa el pedido a *En preparación* y luego a *Listo*.
3. Vuelve a **Soy cliente**: el estado se actualiza solo, y también puedes buscarlo por número.

## Historias de usuario implementadas

| Historia | Dónde está | Criterio de aceptación |
| --- | --- | --- |
| Ver el menú | Vista cliente, sección *Menú* | Muestra productos, precios y disponibilidad. |
| Hacer un pedido | Panel *Tu pedido* | Permite elegir productos, indicar cantidades y confirmar. Valida que haya productos y nombre. |
| Consultar el estado del pedido | Sección *Estado de tu pedido* | Muestra Recibido, En preparación y Listo; se puede buscar por número. |
| Actualizar el estado de un pedido | Vista encargado, tablero | El cambio queda ligado al número de pedido y se ve de inmediato para el cliente. |

Además, el encargado puede marcar productos como agotados o disponibles, y un producto agotado no se puede pedir.

## Estructura

```
cafeteria-conecta/
├── index.html   # estructura de las dos vistas
├── styles.css   # estilos
├── app.js       # lógica: menú, pedidos, estados y almacenamiento
└── README.md
```

## Notas técnicas

- Los datos se guardan en `localStorage`, así que viven en el navegador donde se usa la app. Para usarla desde varios dispositivos haría falta un servidor y una base de datos; eso queda como mejora para un siguiente Sprint.
- El botón *Reiniciar datos de demostración* borra los pedidos y restaura el menú.
- Cada pedido tiene número, cliente, productos, total y estado (0 = Recibido, 1 = En preparación, 2 = Listo).

## Definition of Done

- La funcionalidad cumple con lo acordado en la historia.
- Se revisó y probó el flujo completo (pedido, cambio de estado y consulta).
- No quedan errores importantes conocidos.
- El equipo conoce el resultado y está de acuerdo en darlo por terminado.
- La evidencia queda guardada en este repositorio.
