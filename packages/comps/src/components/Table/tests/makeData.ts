import { faker } from '@faker-js/faker'

/** 定义测试数据的类型 */
export type Person = {
  id: string
  firstName: string
  lastName: string
  age: number
  visits: number
  status: 'In Relationship' | 'Single' | 'Complicated'
  progress: number
}

function newPerson(): Person {
  return {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
    status: faker.helpers.shuffle<Person['status']>([
      'In Relationship',
      'Single',
      'Complicated',
    ])[0]!,
  }
}

export function makeData(len: number) {
  return Array.from({ length: len }, () => newPerson())
}
