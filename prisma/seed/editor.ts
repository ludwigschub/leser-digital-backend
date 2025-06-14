import { Prisma, Source } from "@prisma/client"

import prisma from "../../src/prismaClient"

const getEditors = (source: Source): Prisma.EditorCreateInput[] => [
  {
    name: "Example Editor",
    source: { connect: { id: source.id } },
  },
]

export const seedEditors = async (source: Source) => {
  const editors = getEditors(source)
  return await Promise.all(
    editors.map(async (editor) => await prisma.editor.create({ data: editor }))
  )
}
