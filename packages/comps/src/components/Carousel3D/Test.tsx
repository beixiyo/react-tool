import { Carousel3D } from '.'

const images = [
  'https://ts1.cn.mm.bing.net/th?id=OIP-C.WbD_HELlzoLdkTbXgasarQHaE8&w=224&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',
  'https://ts1.cn.mm.bing.net/th?id=OIP-C.WbD_HELlzoLdkTbXgasarQHaE8&w=224&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',
  'https://ts1.cn.mm.bing.net/th?id=OIP-C.WbD_HELlzoLdkTbXgasarQHaE8&w=224&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',
  'https://ts1.cn.mm.bing.net/th?id=OIP-C.WbD_HELlzoLdkTbXgasarQHaE8&w=224&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',
  'https://ts1.cn.mm.bing.net/th?id=OIP-C.WbD_HELlzoLdkTbXgasarQHaE8&w=224&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',
  'https://ts1.cn.mm.bing.net/th?id=OIP-C.WbD_HELlzoLdkTbXgasarQHaE8&w=224&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',
]

export default function Test() {
  return (
    <div
      className="size-full flex items-center justify-center bg-[#490eff55]"
    >
      <Carousel3D
        srcs={ images }
        className="h-80"
      />
    </div>
  )
}
