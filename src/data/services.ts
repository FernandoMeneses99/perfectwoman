export type Service = {
  id: string
  category: string
  name: string
  description: string
  duration: string
  priceCOP: number
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
    duration: '120 min',
    priceCOP: 120000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9P-6tW6oq4CaXSmwyg-Hgdw8tG4qcpbWMZMcuPkLEceeGzkJaJfl2AzezD93M1FbCzzcjBr15MKte0eyYb3ww1WwQCyPRbmzg_ulUE10xQeiPFW6wkpwFH-7z5P2s6j-1mjO4tkWY_FP3ZtfZ2OX4QP8wRW9IBugdO-V7KrpYifDh0HjrbwcvCXGQSXY7jOZTLFgm6r9DewEgCVlk15A_PlxzBNwjG9qdJGUygXzy',
    imageAlt: 'Macro beauty shot of Russian volume eyelash extensions',
    verified: false,
  },
  {
    id: 'diseno-laminado-cejas',
    category: 'Arquitectura Facial',
    name: 'Diseño y Laminado de Cejas',
    description: 'Moldeado orgánico, fijación de queratina y visagismo milimétrico con depilación de alta definición.',
    duration: '60 min',
    priceCOP: 65000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8BbV-kT90AjCs6_2C3m_hoXcKP2yZ3DjHbFTKOGjEixST6-xI1h4_NCbNQ1DTDigZSACpWxK8y0Z9R_TnLRg_8g6raiNCXi7xO7egL6Z3FWL-4SDa9rB9_gf8jEzb2OE_jksedHpTrSee0YRft3aPDftpc_LbpLNB5BW_naf78Y_SS3zrYQPo3ThiwuoRx4GRchIxUeajdQ03lBS7PSUzbiXq0-Ytr_4qFSCQ80ui',
    imageAlt: 'Impeccable laminated brows on an editorial female model',
    verified: false,
  },
  {
    id: 'lash-lifting-tinte',
    category: 'Efecto Óptico Natural',
    name: 'Lash Lifting & Tinte Profesional',
    description: 'Curvatura desde la raíz que abre tu mirada sin extensiones, con nutrición de keratina intensa.',
    duration: '75 min',
    priceCOP: 85000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC80rEHd1fCZ0jbQLGoKk9GVTqSX2gKRhZdB3LCfN9Rl4i0-U0WXhN4yKR-yje0qtsfwr85S2Mvcq0BSMHNtuY1yFgTkPbHUaNuGODzb_k4QEDxDGA7sg7qEEx06PbedH6ELfxBrmxlioWeDraklPOeadMZLNrDEdmzznc13I2tYjYgu0bDHCukx4lsYOuhOA5FO6RYB7U_tZ7y5R_xXuT4Haqs-5S3itxFYNnz53Sb',
    imageAlt: 'Lash lift close-up showing beautifully lifted and tinted natural eyelashes',
    verified: false,
  },
  {
    id: 'facial-glow-therapy',
    category: 'Hidratación Celular',
    name: 'Cuidado Facial & Glow Therapy',
    description: 'Limpieza profunda, exfoliación no abrasiva y sueros iluminadores para un lienzo dérmico radiante.',
    duration: '90 min',
    priceCOP: 110000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOKrDaHCcq8mpj5ps9CPNEP-bwi-0xWM9J5TnjLk6B9BqdT3UU932p0E01mWbdTzY_HKXULJq29mD0nh6gK5vvytSCgPC6WmW7mhlIBu9AhDwrv5mgOP5OvM8NnIHxVCWGM-BQPpC7_IWZpe__PA1NwcXSCGF7oky03urw41iWMEd9j3P1YqN3hkFyBS3LryQpFhnwDUZ9sNJ5OrFWy9AZtnG8hfvtgTioh1S1BTSl',
    imageAlt: 'Serene aesthetic spa facial treatment',
    verified: false,
  },
]
