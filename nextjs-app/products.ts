/*
For now, we maintain the list of products in this file.
In the future, we may need to refactor this to reflect real-world practices and store the list products in a database.
*/

interface Product {
  id: string;
  name: string;
  price: number;
  imageHref: string;
  description: string;
}

/**
 * Each description was generated using a prompt similar to "Come up with a lengthy description for these shoes" including a photo of the product.
 */
const PRODUCTS: Product[] = [
  { id: '1', name: 'Beige loafers', price: 50.00, imageHref: '/products/beige-loafers.png', description: `These sophisticated loafers are crafted from supple suede in a versatile neutral tone. The classic tassel detail adds a touch of refinement, making them perfect for both casual and semi-formal occasions.  The Goodyear welted construction ensures durability and longevity, while the leather lining and cushioned insole provide exceptional comfort. A timeless addition to any gentleman's wardrobe.` },
  { id: '2', name: 'Black boots', price: 80.00, imageHref: '/products/black-boots.png', description: `These stylish leather boots are designed to elevate your everyday style while providing exceptional comfort and durability. Crafted from high-quality leather, these boots feature a sleek silhouette with a round toe and a chunky heel. The boots have a zipper closure for easy on and off, and the unique textured pattern on the leather adds a touch of sophistication. The interior of the boots is lined with soft leather for a luxurious feel, and the cushioned footbed ensures all-day comfort.` },
  { id: '3', name: 'Purple sneakers', price: 60.00, imageHref: '/products/purple-sneakers.png', description: `These lavender canvas sneakers offer a fresh take on classic casual footwear. The minimalist design features a low-top silhouette with a traditional lace-up closure, ensuring a secure and adjustable fit. The vibrant lavender hue adds a pop of color to any outfit, while the durable canvas construction promises long-lasting wear. The cushioned footbed provides exceptional comfort, making them perfect for everyday activities. Pair these sneakers with jeans, shorts, or skirts for a trendy and effortless look.` },
  { id: '4', name: 'White boots', price: 70.00, imageHref: '/products/white-boots.png', description: `These are a pair of white Chelsea boots with a chunky black sole. The boots have a low heel and a rounded toe. The shaft of the boot is made of a smooth, white leather, and the sole is made of a thick, black rubber. The boots have a pull-on style with elastic side panels for easy on and off. These boots are perfect for a casual everyday look, and can be dressed up or down depending on the occasion.` },
  { id: '5', name: 'Pink running shoes', price: 90.00, imageHref: '/products/pink-running-shoes.jpeg', description: `These shoes are a stylish and functional choice for any active woman. The blush pink color is fun and flattering, while the breathable mesh upper keeps your feet cool and comfortable. The lace-up closure ensures a secure fit, and the cushioned insole provides all-day support. The durable rubber outsole provides excellent traction on any surface. These shoes are perfect for running, walking, or working out at the gym.` },
  { id: '6', name: 'Long black boots', price: 75.00, imageHref: '/products/long-black-boots.png', description: `These are a pair of black, calf-high boots with a chunky, lugged sole. The boots have a rounded toe and a side zipper closure. The upper appears to be made of a smooth, faux leather material, while the sole is likely rubber or a similar synthetic material for durability and traction. The boots have a slight heel and a noticeable platform, adding height and contributing to the overall chunky aesthetic. The shaft of the boot is fitted, but has some give due to the elasticated panel at the back, ensuring a comfortable fit around the calf. These boots are stylish and practical, suitable for a variety of casual outfits and occasions.` },
  { id: '7', name: 'Brown loafers', price: 55.00, imageHref: '/products/brown-loafers.png', description: `These are a classic pair of men's tassel loafers in a rich caramel brown suede. The shoes have a timeless design, with a sleek silhouette and minimal detailing. The tassels add a touch of visual interest, while the suede construction gives the shoes a luxurious feel. The loafers are lined in leather for comfort and durability. The sole is made of high-quality rubber, ensuring good traction and wear. These shoes are perfect for a variety of occasions, from casual Fridays at the office to a night out on the town.` },
  { id: '8', name: 'Purple flats', price: 65.00, imageHref: '/products/purple-flats.png', description: `These lavender shoes are a stylish and versatile footwear option that combines the classic elegance of loafers with a modern touch. The soft lavender hue adds a pop of color to any outfit, while the timeless design ensures they'll never go out of style. The shoes are crafted from high-quality leather, providing both durability and comfort. The leather upper is supple and smooth, conforming to the shape of your foot for a personalized fit. The leather lining and insole offer breathability and moisture-wicking properties, keeping your feet cool and dry throughout the day. The shoes feature a traditional loafer silhouette with a rounded toe and a low heel. The slip-on design makes them easy to wear, while the elasticated side panels ensure a secure and comfortable fit. The lightweight construction and flexible sole provide all-day comfort and support, making them perfect for both casual and formal occasions. These lavender shoes are a versatile addition to any wardrobe. They can be dressed up with a skirt or dress for a sophisticated look, or dressed down with jeans and a t-shirt for a more casual vibe. Whether you're heading to the office, a night out, or a weekend brunch, these shoes will elevate your style and provide effortless comfort.` },
  { id: '9', name: 'White sneakers', price: 75.00, imageHref: '/products/white-sneakers.png', description: `These are a classic pair of white leather sneakers. The shoes have a minimalist design with a low profile. They are made from full-grain leather for the upper and a durable rubber sole. The shoes have a lace-up closure with flat cotton laces. The shoes are finished with subtle stitching details and a comfortable padded insole. They are perfect for everyday wear and can be dressed up or down.` },
];

// This is an "async" function (for future-proofing) in case we decide to maintain the list of products in a database
async function getProductById(productId: string): Promise<Product | undefined> {
  return PRODUCTS.find(product => product.id === productId);
}

export { PRODUCTS, getProductById };
export type { Product };
