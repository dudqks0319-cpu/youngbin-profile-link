import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Get or create admin user (ID = 1)
  const [users] = await connection.query(
    'SELECT * FROM users WHERE id = 1'
  );

  if (users.length === 0) {
    await connection.query(
      'INSERT INTO users (id, openId, name, email, loginMethod, role) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'admin-user-001', '영빈', 'youngbin@example.com', 'manus', 'admin']
    );
    console.log('✓ Admin user created');
  }

  // Create profile
  const [profiles] = await connection.query(
    'SELECT * FROM profiles WHERE userId = 1'
  );

  if (profiles.length === 0) {
    await connection.query(
      `INSERT INTO profiles (userId, displayName, bio, instagramHandle, backgroundColor, socialLinks) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1,
        '영빈',
        '육아용품과 라이프스타일을 소개하는 크리에이터입니다. 실용적인 팁과 추천 제품을 공유합니다.',
        'youngbin_official',
        '#f3e8ff',
        JSON.stringify({
          instagram: 'https://instagram.com/youngbin_official',
          youtube: 'https://youtube.com/@youngbin',
          tiktok: 'https://tiktok.com/@youngbin_official',
          twitter: 'https://twitter.com/youngbin_official',
          email: 'youngbin@example.com'
        })
      ]
    );
    console.log('✓ Profile created');
  }

  // Create links
  const [links] = await connection.query(
    'SELECT COUNT(*) as count FROM links WHERE userId = 1'
  );

  if (links[0].count === 0) {
    const linkData = [
      {
        title: '🛍️ 쿠팡파트너스 스토어',
        url: 'https://link.coupang.com/a/example',
        description: '추천 육아용품 모음',
        isPriority: 1,
        sortOrder: 1
      },
      {
        title: '📸 Instagram 팔로우',
        url: 'https://instagram.com/youngbin_official',
        description: '일상 콘텐츠 보기',
        isPriority: 1,
        sortOrder: 2
      },
      {
        title: '🎥 YouTube 채널',
        url: 'https://youtube.com/@youngbin',
        description: '상세 리뷰 영상',
        isPriority: 0,
        sortOrder: 3
      },
      {
        title: '📱 TikTok 팔로우',
        url: 'https://tiktok.com/@youngbin_official',
        description: '짧은 팁 영상',
        isPriority: 0,
        sortOrder: 4
      },
      {
        title: '💌 이메일 구독',
        url: 'https://example.com/subscribe',
        description: '주간 뉴스레터',
        isPriority: 0,
        sortOrder: 5
      }
    ];

    for (const link of linkData) {
      await connection.query(
        `INSERT INTO links (userId, title, url, description, isPriority, sortOrder, isActive)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [1, link.title, link.url, link.description, link.isPriority, link.sortOrder]
      );
    }
    console.log('✓ Links created');
  }

  // Create carousel images
  const [carousels] = await connection.query(
    'SELECT COUNT(*) as count FROM carouselImages WHERE userId = 1'
  );

  if (carousels[0].count === 0) {
    const carouselData = [
      {
        title: '신생아 필수용품 TOP 5',
        linkUrl: 'https://link.coupang.com/a/example1',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop',
        sortOrder: 1
      },
      {
        title: '아기 수면용품 추천',
        linkUrl: 'https://link.coupang.com/a/example2',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop',
        sortOrder: 2
      },
      {
        title: '이달의 핫딜 상품',
        linkUrl: 'https://link.coupang.com/a/example3',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop',
        sortOrder: 3
      }
    ];

    for (const carousel of carouselData) {
      await connection.query(
        `INSERT INTO carouselImages (userId, title, linkUrl, imageUrl, sortOrder, isActive)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [1, carousel.title, carousel.linkUrl, carousel.imageUrl, carousel.sortOrder]
      );
    }
    console.log('✓ Carousel images created');
  }

  // Create products
  const [products] = await connection.query(
    'SELECT COUNT(*) as count FROM products WHERE userId = 1'
  );

  if (products[0].count === 0) {
    const productData = [
      {
        name: '아기 침대 방지 쿠션',
        description: '안전한 신생아 침대 보호',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
        affiliateUrl: 'https://link.coupang.com/a/product1',
        price: '29,900원',
        sortOrder: 1
      },
      {
        name: '유기농 아기 물티슈',
        description: '순한 성분의 아기 피부용',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
        affiliateUrl: 'https://link.coupang.com/a/product2',
        price: '12,900원',
        sortOrder: 2
      },
      {
        name: '아기 손톱깎이 세트',
        description: '안전한 신생아 손톱 관리',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
        affiliateUrl: 'https://link.coupang.com/a/product3',
        price: '8,900원',
        sortOrder: 3
      },
      {
        name: '아기 목욕 온도계',
        description: '정확한 물 온도 측정',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
        affiliateUrl: 'https://link.coupang.com/a/product4',
        price: '15,900원',
        sortOrder: 4
      }
    ];

    for (const product of productData) {
      await connection.query(
        `INSERT INTO products (userId, name, description, imageUrl, affiliateUrl, price, sortOrder, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [1, product.name, product.description, product.imageUrl, product.affiliateUrl, product.price, product.sortOrder]
      );
    }
    console.log('✓ Products created');
  }

  console.log('\n✅ Database seeding completed successfully!');
} catch (error) {
  console.error('❌ Error seeding database:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
