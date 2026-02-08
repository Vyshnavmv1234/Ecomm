import PDFDocument from "pdfkit"
import Order from "../../models/orderSchema.js"

const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId

    const order = await Order.findById(orderId)
      .populate("orderItems.product")

    if (!order) {
      return res.redirect("/user/pageNotFound")
    }

    /* ============ HEADERS ============ */
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    )

    const doc = new PDFDocument({ margin: 50 })
    doc.pipe(res)

    /* ============ HEADER ============ */
    doc.fontSize(20).text("INVOICE", { align: "center" })
    doc.moveDown()

    doc.fontSize(10)
    doc.text(`Order ID: ${order._id}`)
    doc.text(`Order Date: ${order.createdAt.toDateString()}`)
    doc.text(`Payment Method: ${order.paymentMethod || "COD"}`)
    doc.moveDown()

    /* ============ ADDRESS ============ */
    doc.fontSize(12).text("Shipping Address")
    doc.fontSize(10)
    doc.text(order.shipping_address.name)
    doc.text(order.shipping_address.house)
    doc.text(order.shipping_address.streetName)
    doc.text(
      `${order.shipping_address.city}, ${order.shipping_address.state}`
    )
    doc.text(order.shipping_address.pincode)
    doc.text(`Phone: ${order.shipping_address.phone}`)
    doc.moveDown(2)

    /* ============ TABLE ============ */
    const colProduct = 50
    const colQty = 300
    const colPrice = 360
    const colTotal = 450
    const tableRightEdge = colTotal + 100

    doc.fontSize(12).text("Order Items")
    doc.moveDown()

    const headerY = doc.y

    doc.fontSize(10)
    doc.text("Product", colProduct, headerY)
    doc.text("Qty", colQty, headerY)
    doc.text("Price (Rs.)", colPrice, headerY)
    doc.text("Total (Rs.)", colTotal, headerY)

    doc.moveDown(0.5)
    doc.moveTo(colProduct, doc.y)
      .lineTo(tableRightEdge, doc.y)
      .stroke()
    doc.moveDown()

    /* ===== TABLE ROWS ===== */
    order.orderItems.forEach(item => {
      if (item.status === "cancelled") return

      const y = doc.y
      const productName =
        item.product?.name || "Product unavailable"

      const rowHeight = Math.max(
        doc.heightOfString(productName, { width: 220 }),
        16
      )

      doc.text(productName, colProduct, y, { width: 220 })
      doc.text(String(item.quantity), colQty, y)
      doc.text(`Rs. ${item.unitPrice}`, colPrice, y)
      doc.text(
        `Rs. ${item.unitPrice * item.quantity}`,
        colTotal,
        y
      )

      doc.y = y + rowHeight + 6
    })

    /* ============ SUMMARY (REBUILT CORRECTLY) ============ */

    // lock summary BELOW table, not floating
    const summaryTop = doc.y + 30

    const labelX = colTotal - 90
    const valueX = colTotal
    const valueWidth = 100
    const rowGap = 18

    let y = summaryTop

    doc.fontSize(10).font("Helvetica")

    // Subtotal
    doc.text("Subtotal", labelX, y)
    doc.text(
      `Rs. ${order.orderSummary.subTotal}`,
      valueX,
      y,
      { width: valueWidth, align: "right" }
    )

    y += rowGap

    // Discount
    doc.text("Discount", labelX, y)
    doc.text(
      `Rs. ${order.orderSummary.discount}`,
      valueX,
      y,
      { width: valueWidth, align: "right" }
    )

    y += rowGap

    // Divider
    doc.moveTo(labelX, y)
      .lineTo(tableRightEdge, y)
      .stroke()

    y += 8

    // Total
    doc.font("Helvetica-Bold")
    doc.text("Total", labelX, y)
    doc.text(
      `Rs. ${order.orderSummary.total}`,
      valueX,
      y,
      { width: valueWidth, align: "right" }
    )

    doc.font("Helvetica")

    /* ============ END PDF ============ */
    doc.end()

  } catch (error) {
    console.error("Invoice error", error)
    return res.redirect("/user/pageNotFound")
  }
}

export default {generateInvoice} 
