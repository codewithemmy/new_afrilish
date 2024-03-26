const createPayout = {
  userType: {
    notEmpty: true,
    errorMessage: "userType cannot be empty",
    trim: true,
  },
  amount: {
    notEmpty: true,
    errorMessage: "amount cannot be empty",
    trim: true,
  },
}

export default createPayout
