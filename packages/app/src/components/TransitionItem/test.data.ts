import { uniqueId } from '@jl-org/tool'

export interface MockPost {
  id: string
  title: string
  imageUrlSmall: string
  imageUrlLarge: string
  category: string
  excerpt: string
  fullContent: string
}

export const LIST_ID = `list-${uniqueId()}`

export const mockPosts: MockPost[] = [
  {
    id: `detail-${uniqueId()}`,
    title: '绚丽北极光',
    imageUrlSmall: 'https://picsum.photos/200/300?r=1',
    imageUrlLarge: 'https://picsum.photos/200/300?r=1',
    category: '自然奇观',
    excerpt: '在地球的磁极附近，高层大气中带电粒子与大气分子碰撞产生的壮丽发光现象。',
    fullContent: '北极光（Aurora Borealis）和南极光（Aurora Australis）是地球上最令人叹为观止的自然现象之一。它们通常出现在高纬度地区，是太阳风暴带来的带电粒子流（等离子体）与地球磁场相互作用，进入地球大气层并激发或电离大气中的原子和分子（主要是氧和氮）时产生的发光现象。光的颜色取决于被激发的原子类型以及激发的高度。绿色和粉红色是最常见的颜色，由氧原子产生；蓝色和紫色则通常由氮分子产生。',
  },
  {
    id: `detail-${uniqueId()}`,
    title: '东京夜景',
    imageUrlSmall: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9reW8lMjBuaWdodCUyMHNreWxpbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60',
    imageUrlLarge: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9reW8lMjBuaWdodCUyMHNreWxpbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80',
    category: '城市风光',
    excerpt: '霓虹闪烁，高楼林立，展现了这座国际大都市的繁华与活力。',
    fullContent: '东京，作为日本的首都和世界上最大的都市圈之一，其夜景是现代文明的缩影。从高耸的东京晴空塔或东京塔俯瞰，无数灯光汇聚成一片璀璨的星海。新宿的摩天大楼群、涩谷繁忙的十字路口、银座的奢华店铺，共同构成了这幅动态的城市画卷。东京的夜生活同样丰富多彩，从传统的居酒屋到时尚的夜店，满足了各种人群的需求。',
  },
]
