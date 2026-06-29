export const allLevelsQuery = `
  *[_type == "curriculum"] | order(orderRank asc) {
    _id,
    title,
    description,
    difficultyLevel,
    duration,
    skills,
    activityCount,
    orderRank,
   levelImage
  }
`;