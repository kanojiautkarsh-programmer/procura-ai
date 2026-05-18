export function paginate(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}
