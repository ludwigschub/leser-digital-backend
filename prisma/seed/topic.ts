import { ArticleCategory, Prisma } from "@prisma/client"

import prisma from "../../src/prismaClient"

const getTopics = (): Prisma.TopicCreateInput[] => [
  {
    category: ArticleCategory.ART,
    name: "Kunst",
    banner: "https://live.staticflickr.com/757/22174602880_4cf6f6f9cc_b.jpg",
  },
  {
    category: ArticleCategory.ANIMALS,
    name: "Tiere",
    banner: "https://live.staticflickr.com/65535/49958524703_fc3af9c069_b.jpg",
  },
  {
    category: ArticleCategory.BREAKING,
    name: "Eilmeldungen",
    banner: "https://live.staticflickr.com/65535/49132587502_8f898f54f7_b.jpg",
  },
  {
    category: ArticleCategory.BUSINESS,
    name: "Business",
    banner: "https://live.staticflickr.com/65535/52024579446_74a08ba509_b.jpg",
  },
  {
    category: ArticleCategory.CRIME,
    name: "Kriminalität",
    banner:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Crime-scene-do-not-cross.jpg",
  },
  {
    category: ArticleCategory.CULTURE,
    name: "Kultur",
    banner: "https://live.staticflickr.com/3431/3186353516_b020f5586b_b.jpg",
  },
  {
    category: ArticleCategory.EDUCATION,
    name: "Bildung",
    banner: "https://live.staticflickr.com/3389/3433059070_6e431d84dd_b.jpg",
  },
  {
    category: ArticleCategory.ENTERTAINMENT,
    name: "Unterhaltung",
    banner: "https://live.staticflickr.com/2081/2431543939_5f5c4c4294_o.jpg",
  },
  {
    category: ArticleCategory.ENVIRONMENT,
    name: "Umwelt",
    banner: "https://live.staticflickr.com/2850/11424386506_2a506fd880_b.jpg",
  },
  {
    category: ArticleCategory.FASHION,
    name: "Fashion",
    banner: "https://live.staticflickr.com/4208/35710732401_d5e2799982_b.jpg",
  },
  {
    category: ArticleCategory.FITNESS,
    name: "Fitness",
    banner: "https://live.staticflickr.com/755/20767034820_ae7dcae776_b.jpg",
  },
  {
    category: ArticleCategory.FOOD,
    name: "Essen",
    banner:
      // eslint-disable-next-line max-len
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Arabic-Shells-Dips-Sauces-Dumplings-Appetizers-Vegetables-1626976.jpg",
  },
  {
    category: ArticleCategory.GAMING,
    name: "Gaming",
    banner: "https://live.staticflickr.com/3887/14948886566_7f606b520a_b.jpg",
  },
  {
    category: ArticleCategory.HEALTH,
    name: "Gesundheit",
    banner: "https://live.staticflickr.com/8894/28290929600_a6b6a88d1d_o.jpg",
  },
  {
    category: ArticleCategory.HISTORY,
    name: "Geschichte",
    banner: "https://live.staticflickr.com/3787/10531479356_21941d702a_b.jpg",
  },
  {
    category: ArticleCategory.LAW,
    name: "Recht",
    banner: "https://live.staticflickr.com/778/31754979910_6266519018_b.jpg",
  },
  {
    category: ArticleCategory.LITERATURE,
    name: "Literatur",
    banner: "https://live.staticflickr.com/504/18501292075_59e5db288d_b.jpg",
  },
  {
    category: ArticleCategory.MOVIES,
    name: "Film",
    banner: "https://live.staticflickr.com/7790/17964851090_ea17e5b0c5_o.jpg",
  },
  {
    category: ArticleCategory.MUSIC,
    name: "Musik",
    banner: "https://live.staticflickr.com/7778/17659296733_c184c94ffc_b.jpg",
  },
  {
    category: ArticleCategory.NATURE,
    name: "Natur",
    banner: "https://live.staticflickr.com/7433/10802496695_d8a2412016_b.jpg",
  },
  {
    category: ArticleCategory.PHILOSOPHY,
    name: "Philosophie",
    banner:
      // eslint-disable-next-line max-len
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Greece_from_the_Coming_of_the_Hellenes_to_AD._14%2C_page_201%2C_Socrates.jpg",
  },
  {
    category: ArticleCategory.POLITICS,
    name: "Politik",
    banner: "https://live.staticflickr.com/65535/51940467059_28e3937376_b.jpg",
  },
  {
    category: ArticleCategory.PSYCHOLOGY,
    name: "Psychologie",
    banner: "https://live.staticflickr.com/65535/52413205141_3958a5f827_b.jpg",
  },
  {
    category: ArticleCategory.PUZZLE,
    name: "Rätsel",
    banner: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Puzzle.jpg",
  },
  {
    category: ArticleCategory.RELIGION,
    name: "Religion",
    banner: "https://live.staticflickr.com/824/41648324291_a2f726885b_b.jpg",
  },
  {
    category: ArticleCategory.SCIENCE,
    name: "Wissenschaft",
    banner: "https://live.staticflickr.com/7862/39907044863_f1e877500f_b.jpg",
  },
  {
    category: ArticleCategory.SPORTS,
    name: "Sport",
    banner: "https://live.staticflickr.com/3883/14239464268_ce63ddcece.jpg",
  },
  {
    category: ArticleCategory.TECHNOLOGY,
    name: "Technologie",
    banner: "https://live.staticflickr.com/2810/33337362190_28810ac615_o.jpg",
  },
  {
    category: ArticleCategory.TRAVEL,
    name: "Reisen",
    banner: "https://live.staticflickr.com/65535/51537246564_4d6e3ea0fd_b.jpg",
  },
  {
    category: ArticleCategory.WEATHER,
    name: "Wetter",
    banner: "https://live.staticflickr.com/65535/51370761674_2eac222544_b.jpg",
  },
  {
    category: ArticleCategory.FINANCE,
    name: "Finanzen",
    banner: "https://live.staticflickr.com/44/132198746_a2f53e2ee1_b.jpg",
  },
  {
    category: ArticleCategory.AUTOMOTIVE,
    name: "Autos",
    banner: "https://live.staticflickr.com/407/19472298124_2729b352f6_b.jpg",
  },
  { category: ArticleCategory.UNKNOWN, name: "Unbekannt", banner: "" },
]

export const seedTopics = async () => {
  const topics = getTopics()
  return await Promise.all(
    topics.map((topic) => {
      return prisma.topic.create({ data: { ...topic } })
    })
  )
}
