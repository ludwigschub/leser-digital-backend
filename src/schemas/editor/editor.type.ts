import { objectType } from "nexus"
import { Editor as EditorType } from "nexus-prisma"

export const Editor = objectType({
  name: EditorType.$name,
  description: EditorType.$description,
  definition(t) {
    t.field(EditorType.id)
    t.field(EditorType.name)
    t.field(EditorType.createdAt)
    t.field(EditorType.updatedAt)
    t.field(EditorType.articles)
    t.field(EditorType.source)
  },
})
