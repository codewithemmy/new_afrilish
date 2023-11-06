import { appendFileSync } from "fs"

class CouponCodeFile {
  private couponCode
  private id

  constructor(id: number, couponCode: string) {
    this.couponCode = couponCode
    this.id = id
  }

  saveAsCSV(fileName: string) {
    const csv = `${this.id}, ${this.couponCode}\n`
    try {
      appendFileSync(`./${fileName}_coupons.csv`, csv)
    } catch (err) {
      console.error(err)
    }
  }
}

export default CouponCodeFile
