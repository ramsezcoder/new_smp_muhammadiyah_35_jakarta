import React from 'react';

const GoogleMapSection = () => {
  return (
    <section className="py-12 md:py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="bg-white p-3 md:p-4 rounded-3xl shadow-xl border border-gray-100">
          <div className="rounded-2xl overflow-hidden h-[350px] md:h-[450px] w-full relative z-10">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.976!2d106.787!3d-6.267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1a7b9876543%3A0xabcdef123456789!2sJl.%20Panjang%20No.19%2C%20RT.8%2FRW.9%2C%20Cipulir%2C%20Kec.%20Kebayoran%20Lama%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012230!5e0!3m2!1sen!2sid!4v1673000000000!5m2!1sen!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="SMP Muhammadiyah 35 Jakarta - Jl. Panjang No.19, RT.8/RW.9, Cipulir, Kebayoran Lama, Jakarta Selatan 12230"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleMapSection;