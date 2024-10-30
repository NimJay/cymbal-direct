'use client';

import styles from './placeholder-products-section.module.css';

const PRODUCTS = [
  { name: 'Beige loafers', price: 50.00, imageHref: '/products/beige-loafers.png' },
  { name: 'Black boots', price: 80.00, imageHref: '/products/black-boots.png' },
  { name: 'Purple sneakers', price: 60.00, imageHref: '/products/purple-sneakers.png' },
  { name: 'White boots', price: 70.00, imageHref: '/products/white-boots.png' },
  { name: 'Pink running shoes', price: 90.00, imageHref: '/products/pink-running-shoes.png' },
  { name: 'Long black boots', price: 75.00, imageHref: '/products/long-black-boots.png' },
  { name: 'Brown loafers', price: 55.00, imageHref: '/products/brown-loafers.png' },
  { name: 'Purple flats', price: 65.00, imageHref: '/products/purple-flats.png' },
  { name: 'White sneakers', price: 75.00, imageHref: '/products/white-sneakers.png' },
];

export default function PlaceholderProductsSection() {
  const productsLis = PRODUCTS.map((product, index) => {
    return (
      <li key={index} title="This product is just a placeholder." className={styles.productLi}>
        <div className={styles.productImgContainer}>
          <img src={product.imageHref} alt={product.name} />
          <div className={styles.productImgOverlay}></div>
        </div>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>${product.price}</p>
      </li>
    );
  });
  return (
    <section className={styles.placeholderProductsSection}>
      <h2>Featured products</h2>
      <ul>{productsLis}</ul>
    </section>
  );
}
