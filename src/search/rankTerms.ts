import { exit } from "process";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import prisma from "../prismaClient";

import { rankSearchTerms } from "./rankSearchTerms";
(async () => {
  const argv = await yargs(hideBin(process.argv)).option("all", {
    type: "boolean",
    description: "Rank all search terms",
    default: false,
  }).argv
  if (argv.all) {
    const searchTerms = await prisma.searchTerm.findMany({})
    await rankSearchTerms(searchTerms)
  } else {
    const unrankedTerms = await prisma.searchTerm.findMany({
      where: {
        ranking: {
          is: null,
        },
      },
    })
    await rankSearchTerms(unrankedTerms)
  }
  exit()
})()
