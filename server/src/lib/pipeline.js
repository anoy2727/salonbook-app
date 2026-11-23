// Re-usable MongoDB aggregation stages: join appointment with its service and customer
export const detailStages = [
  { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service" } },
  { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "user", localField: "customerId", foreignField: "_id", as: "customer" } },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  {
    $addFields: {
      customer: {
        _id: "$customer._id",
        name: "$customer.name",
        email: "$customer.email",
        image: "$customer.image",
        phone: "$customer.phone",
      },
    },
  },
];
