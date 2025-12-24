'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';
import styles from './ImageSlider.module.css';

const ImageSlider = () => {
  // List of images in the public/pictures folder
  const images = [
    { id: 1, src: '/pictures/IMG_1575.JPG', alt: 'Gallery Image 3' },
    { id: 2, src: '/pictures/DSC_0701.JPG', alt: 'Gallery Image 2' },
    { id: 3, src: '/pictures/DSC_0691.JPG', alt: 'Gallery Image 1' },
    { id: 4, src: '/pictures/IMG_1587.jpg', alt: 'Gallery Image 4' },
    { id: 5, src: '/pictures/IMG_1673.jpg', alt: 'Gallery Image 5' },
    { id: 6, src: '/pictures/IMG_1698.jpg', alt: 'Gallery Image 6' },
    { id: 7, src: '/pictures/IMG_1708.jpg', alt: 'Gallery Image 7' },
    { id: 8, src: '/pictures/IMG_1732.jpg', alt: 'Gallery Image 8' },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto mb-12 px-4">
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className={styles.swiper}
      >
        {images.map((image) => (
          <SwiperSlide key={image.id}>
            <Image
              src={image.src}
              alt={image.alt}
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-xl"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ImageSlider;