export type Service = {
  id: string
  category: string
  name: string
  description: string
  duration: string
  durationVerified: boolean
  priceCOP: number | null
  priceVerified: boolean
  image: string
  imageAlt: string
  verified?: boolean
}

export const services: Service[] = [
  {
    id: 'pestanas-pelo-a-pelo-volumen',
    category: 'Extensiones de Autor',
    name: 'Pestañas Pelo a Pelo & Volumen',
    description: 'Fibras ultrafinas aplicadas con mapeo anatómico según la densidad de tu pestaña natural.',
    duration: '60 min',
    durationVerified: true,
    priceCOP: 120000,
    priceVerified: true,
    image: '/images/pestañas-pelo-a-pelo.jpg',
    imageAlt: 'Pestañas pelo a pelo y volumen realizadas en Perfect Woman T',
    verified: true,
  },
  {
    id: 'diseno-laminado-cejas',
    category: 'Arquitectura Facial',
    name: 'Diseño y Laminado de Cejas',
    description: 'Moldeado orgánico, fijación de queratina y visagismo milimétrico con depilación de alta definición.',
    duration: '40 min',
    durationVerified: false,
    priceCOP: 65000,
    priceVerified: false,
    image: '/images/diseño-laminado.jpg',
    imageAlt: 'Diseño y laminado de cejas realizado en Perfect Woman T',
    verified: false,
  },
  {
    id: 'lash-lifting-tinte',
    category: 'Efecto Óptico Natural',
    name: 'Lash Lifting & Tinte Profesional',
    description: 'Curvatura desde la raíz que abre tu mirada sin extensiones, con nutrición de keratina intensa.',
    duration: '50 min',
    durationVerified: false,
    priceCOP: 85000,
    priceVerified: false,
    image: '/images/lash-lifting.jpg',
    imageAlt: 'Lash lifting y tinte realizado en Perfect Woman T',
    verified: false,
  },
  {
    id: 'facial-glow-therapy',
    category: 'Hidratación Celular',
    name: 'Cuidado Facial & Glow Therapy',
    description: 'Limpieza profunda, exfoliación no abrasiva y sueros iluminadores para un lienzo dérmico radiante.',
    duration: '60 min',
    durationVerified: false,
    priceCOP: 110000,
    priceVerified: false,
    image: '/images/glow-terapy.jpg',
    imageAlt: 'Cuidado facial y glow therapy realizado en Perfect Woman T',
    verified: false,
  },
]
