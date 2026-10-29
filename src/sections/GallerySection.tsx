export default function GallerySection() {
  return (
    <section id="galeria" className="w-full bg-background py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Portafolio Fotográfico</span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight mt-1">Galería Editorial de Resultados</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mt-2">
              Miradas reales transformadas con precisión artesanal en nuestro atelier de Bogotá.
            </p>
          </div>
          <a className="px-6 py-3 bg-surface-container-lowest text-primary font-label-caps text-label-caps uppercase tracking-widest shadow-sm hover:bg-primary hover:text-on-primary transition-all" href="#galeria">
            Ver galería completa y detalles
          </a>
        </div>
        <div className="mt-space-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter items-stretch">
          <div className="lg:col-span-7 relative group overflow-hidden bg-surface-container-high shadow-sm aspect-[16/10] sm:aspect-auto sm:min-h-[380px]">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Pestañas clásicas 1:1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqvZ70npqn_ctTv3LdtGpLGDGIATiPuIGToWV4Y9xgDmuLF8zK4-jMdBaELF_VPKI0Avx0f5lXVTNV4sORIo4GmtvQ3oXhGG46OrCauI03esOblZqJu4U2PsAGX_yqCElKtRkS6U00EA1sb0hKOVUNJJvSHR5OWiQtg0nEowDufvEhNMT2L0HQ3g4guDufdZHBRL2Q36B7Izp9WzqRL2dYamKdt5cCB0fQzQWkKlWe" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            <div className="absolute bottom-4 left-4 right-4 p-space-sm flex items-end justify-between text-on-primary">
              <div>
                <span className="font-label-caps text-[10px] uppercase text-secondary-fixed tracking-wider">Efecto Seda</span>
                <h4 className="font-headline-sm text-headline-sm font-semibold">Pestañas Clásicas 1:1</h4>
              </div>
              <span className="font-label-caps text-label-caps px-2.5 py-1 bg-surface-container-lowest/20 backdrop-blur-sm uppercase">Curva D / 0.15</span>
            </div>
          </div>
          <div className="lg:col-span-5 relative group overflow-hidden bg-surface-container-high shadow-sm aspect-[4/3] sm:aspect-auto sm:min-h-[380px]">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cejas con efecto sombra" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPqg75o4YBb8aJcM33tGKXPUirEZuHUeU-i-21xzxCHhKX8MY2RVP-jumoO0_5_B9kZnIjItU4f_3yN8KBrQyFwVZQgSVrjvOA28kvbgjWiDJcCYfPkn4nhYxU_A1B943WQ6GG74cwpN9zRGH7yrc9yrlCvMKb6GQLUjOLmg3m9qxO5JuAeQkKb5Z22k762_MGzo6iVhXoJnPzPQiy8QF2nLoi8HnIB9B349s_mpi3" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-4 left-4 right-4 p-space-sm flex items-end justify-between text-on-primary">
              <div>
                <span className="font-label-caps text-[10px] uppercase text-secondary-fixed tracking-wider">Henna Orgánica</span>
                <h4 className="font-headline-sm text-headline-sm font-semibold">Cejas Efecto Sombra</h4>
              </div>
              <span className="font-label-caps text-label-caps px-2.5 py-1 bg-surface-container-lowest/20 backdrop-blur-sm uppercase">Visagismo</span>
            </div>
          </div>
          <div className="lg:col-span-4 relative group overflow-hidden bg-surface-container-high shadow-sm aspect-[4/3]">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Lash lifting natural" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAhscrOLscd3-IWFgI5ep6FQf_5aqPwH0ydllmiA1cM8WZGeuNj2AjBjvRlABtv8zsezV8ztZtCQJ960CD0keUex9tyu2qeC-U1d-XVfoeXBNyOuui08oTxSQooDaL205pa518F9LTcLRqW6L46-r6W2MnGpWfJmCrGHUUrhfhQnc_b8Jxplo0RdCEXtZCZyLa1bsv4iDEjoDBr5TCfkkkIAf1HOeeUOluFr24r5_z" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-4 left-4 right-4 p-space-sm flex items-end justify-between text-on-primary">
              <div>
                <span className="font-label-caps text-[10px] uppercase text-secondary-fixed tracking-wider">Queratina Pura</span>
                <h4 className="font-title-lg text-title-lg font-semibold">Lifting Natural</h4>
              </div>
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="lg:col-span-4 relative group overflow-hidden bg-surface-container-high shadow-sm aspect-[4/3]">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Volumen ruso" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhfvZMWiYE6qYo9NNF5bs3ZkLGT1cYh_lUp-SoZff_NxCgLQgun5eLQ5EZdD2rHHgNV8dLdYBmrb0Bh4hj6ijWYV5Fa3vzvCiF6rwBICbXGdfxJ4UgPTyaYAskT63et-H5P4sOvFgsK2G7aA7UoA1CCWrhi0F4LaAvtB5xKmRMZA59SHL8zjOTZhqj3z-2ZoIPZdofLSosrjFDIFNokcGjEXXfEhr2o3fhzMb9Tgrq" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-4 left-4 right-4 p-space-sm flex items-end justify-between text-on-primary">
              <div>
                <span className="font-label-caps text-[10px] uppercase text-secondary-fixed tracking-wider">Densidad 4D</span>
                <h4 className="font-title-lg text-title-lg font-semibold">Volumen Glam Ruso</h4>
              </div>
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
          </div>
          <div className="lg:col-span-4 relative group overflow-hidden bg-surface-container-high shadow-sm aspect-[4/3]">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Ambiente del salón" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxddXlw1s8_F49xZTsooyQVcyEIG34pSB4UZYaMquU2rUKk5Bi56uBhR9TBsDpv_Pts9LcLE0hQRojDyQlPOd4sbl2_pjzD1JyfTaZiyIJm6ZU9DahxoYnw8sYAvT2u37XNQTFX5goU8HycVBZVaQEgj9zYtyMSpzJY8dA6Z2C-n4vzhBItWei2eWwugnXLF1_HaLU8_bgDkVCczX3qHQlCvABSiIbQW5PS13ZKiCX" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-4 left-4 right-4 p-space-sm flex itemsield justify-between text-on-primary">
              <div>
                <span className="font-label-caps text-[10px] uppercase text-secondary-fixed tracking-wider">Espacio Privado</span>
                <h4 className="font-title-lg text-title-lg font-semibold">Ambiente del Salón</h4>
              </div>
              <span className="material-symbols-outlined text-[18px]">spa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
