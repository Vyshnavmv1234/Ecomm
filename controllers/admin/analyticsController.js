import User from "../../models/userSchema.js"
import Order from "../../models/orderSchema.js"
import ExcelJS from "exceljs";
import PDFDocument  from "pdfkit";

const loadAnalytics = async (req,res)=>{
  try {
    const admin = await User.findOne({isAdmin:true})
    
    return res.render("admin/salesAnalytics",{admin:admin.name,orders:[]})
    
  } catch (error) {
    console.error(error)
  }
}
const postAnalytics = async (req,res)=>{
  try{

  const { report, from, to } = req.query;
  console.log(report,from,to)

  let startDate;
  let endDate = new Date();

  switch(report){

    case "daily":
      startDate = new Date();
      startDate.setHours(0,0,0,0);
      break;

    case "weekly":
      startDate = new Date();
      startDate.setDate(startDate.getDate()-7);
      break;

    case "yearly":
      startDate = new Date();
      startDate.setFullYear(
        startDate.getFullYear()-1
      );
      break;

    case "custom":
      startDate = new Date(from);
      endDate = new Date(to);
      break;

    default:
      startDate = new Date("2000-01-01");
  }

  const analytics = await Order.aggregate([
    {
      $match:{
        status:"delivered",
        createdAt:{
          $gte:startDate,
          $lte:endDate
        }
      }
    },
    {
      $group:{
        _id:null,
        orderCount:{$sum:1},
        grossSale:{$sum:"$orderSummary.total"},
        couponDiscount:{$sum:"$orderSummary.coupon"},
        overallDiscount:{
          $sum:{
            $add:[
              "$orderSummary.discount",
              "$orderSummary.coupon"
            ]
          }
        }
      }
    }
  ]);

  const orders = await Order.find({
    status:"delivered",
    createdAt:{
      $gte:startDate,
      $lte:endDate
    }
  }).populate("userId");

  const data = analytics[0] || {};

  res.json({
    orderCount:data.orderCount || 0,
    grossSale:data.grossSale || 0,
    couponDiscount:data.couponDiscount || 0,
    overallDiscount:data.overallDiscount || 0,
    orders
  });

 }catch(err){
  console.log(err);
 }
}

const exportPDF = async (req,res)=>{

  try{

    const { report, from, to } = req.query;

    let startDate;
    let endDate = new Date();


    switch(report){

    case "daily":
    startDate = new Date();
    startDate.setHours(0,0,0,0);
    break;

    case "weekly":
    startDate = new Date();
    startDate.setDate(startDate.getDate()-7);
    break;
    
    case "monthly":
    startDate = new Date();
    startDate.setDate(1);        
    startDate.setHours(0,0,0,0);
    break;

    case "yearly":
    startDate = new Date();
    startDate.setFullYear(startDate.getFullYear()-1);
    break;

    case "custom":
    startDate = new Date(from);
    endDate = new Date(to);
    break;

    default:
    startDate = new Date("2000-01-01");
    }

    const orders = await Order.find({ 
    status:"delivered",
    createdAt:{
    $gte:startDate,
    $lte:endDate
    }
    }).populate("userId");


    let totalOrders = orders.length;
    let grossSale = 0;
    let couponDiscount = 0;
    let overallDiscount = 0;

    orders.forEach(order=>{
    grossSale += order.orderSummary.total;
    couponDiscount += order.orderSummary.coupon;

    overallDiscount +=
    order.orderSummary.coupon +
    order.orderSummary.discount;
    });

    /* ========= PDF ========= */

    const doc = new PDFDocument({margin:40});

    res.setHeader("Content-Type","application/pdf");
    res.setHeader(
    "Content-Disposition",
    "attachment; filename=sales-report.pdf"
    );

    doc.pipe(res);

    /* ========= TITLE ========= */

    doc
    .fontSize(18)
    .text("Sales Analytics Report",{align:"center"});

    doc.moveDown();

    doc
    .fontSize(12)
    .text(
    `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    {align:"center"}
    );

    doc.moveDown(2);

    /* ========= SUMMARY BOX ========= */

    const summaryY = doc.y;

    const boxWidth = 130;
    const boxHeight = 50;
    const startX = 40;

    const summaryData = [
    ["Total Orders", totalOrders],
    ["Gross Sales", `₹${grossSale.toFixed(2)}`],
    ["Coupon Discount", `₹${couponDiscount}`],
    ["Overall Discount", `₹${overallDiscount}`]
    ];

    summaryData.forEach((item,i)=>{

    const x = startX + i*(boxWidth+10);

    doc.rect(x,summaryY,boxWidth,boxHeight).stroke();

    doc
    .fontSize(10)
    .text(item[0],x+10,summaryY+8);

    doc
    .fontSize(14)
    .text(item[1],x+10,summaryY+25);

    });

    doc.moveDown(4);

    /* ========= TABLE ========= */

    const tableTop = doc.y;

    const colX = {
    order:40,
    customer:90,
    payment:180,
    amount:260,
    discount:340,
    total:430,
    date:510
    };

    /* HEADER BORDER */
    doc.rect(40,tableTop,520,20).stroke();

    doc.fontSize(10);

    doc.text("Order",colX.order,tableTop+5);
    doc.text("Customer",colX.customer,tableTop+5);
    doc.text("Payment",colX.payment,tableTop+5);
    doc.text("Amount",colX.amount,tableTop+5);
    doc.text("Discount",colX.discount,tableTop+5);
    doc.text("Total",colX.total,tableTop+5);
    doc.text("Date",colX.date,tableTop+5);

    let rowY = tableTop + 20;

    /* ========= TABLE ROWS ========= */

    orders.forEach(order=>{

    const discount =
    order.orderSummary.discount +
    order.orderSummary.coupon;

    /* row border */
    doc.rect(40,rowY,520,20).stroke();

    doc.text(
    order._id.toString().slice(-6),
    colX.order,rowY+5
    );

    doc.text(
    order.userId?.name || "User",
    colX.customer,rowY+5
    );

    doc.text(
    order.paymentMethod,
    colX.payment,rowY+5
    );

    doc.text(
    `₹${order.orderSummary.subTotal}`,
    colX.amount,rowY+5
    );

    doc.text(
    `₹${discount}`,
    colX.discount,rowY+5
    );

    doc.text(
    `₹${order.orderSummary.total}`,
    colX.total,rowY+5
    );

    doc.text(
    new Date(order.createdAt)
    .toLocaleDateString(),
    colX.date,rowY+5
    );

    rowY += 20;

    /* PAGE BREAK */
    if(rowY > 750){
    doc.addPage();
    rowY = 40;
    }

    });

    doc.end();

    }catch(err){
      console.log(err);
    }

    };

const exportExcel = async (req, res) => {
  try {

    const { report, from, to } = req.query;

    let startDate;
    let endDate = new Date();

    switch (report) {

      case "daily":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;

      case "weekly":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;

      case "yearly":
        startDate = new Date();
        startDate.setFullYear(
          startDate.getFullYear() - 1
        );
        break;

      case "custom":
        startDate = new Date(from);
        endDate = new Date(to);
        break;

      default:
        startDate = new Date("2000-01-01");
    }


    const orders = await Order.find({
      status: "delivered",
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate("userId");


    let grossSale = 0;
    let couponDiscount = 0;
    let overallDiscount = 0;

    orders.forEach(order => {
      grossSale += order.orderSummary.total;
      couponDiscount += order.orderSummary.coupon;

      overallDiscount +=
        order.orderSummary.discount +
        order.orderSummary.coupon;
    });

    /* ================= EXCEL WORKBOOK ================= */

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    /* ================= TITLE ================= */

    sheet.mergeCells("A1:G1");

    sheet.getCell("A1").value =
      "Sales Analytics Report";

    sheet.getCell("A1").font = {
      size: 16,
      bold: true
    };

    sheet.getCell("A1").alignment = {
      horizontal: "center"
    };

    /* ================= DATE RANGE ================= */

    sheet.mergeCells("A2:G2");

    sheet.getCell("A2").value =
      `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    sheet.getCell("A2").alignment = {
      horizontal: "center"
    };

    /* ================= SUMMARY SECTION ================= */

    sheet.addRow([]);

    const summaryHeader = sheet.addRow([
      "Total Orders",
      "Gross Sales",
      "Coupon Discount",
      "Overall Discount"
    ]);

    summaryHeader.font = { bold: true };

    sheet.addRow([
      orders.length,
      grossSale,
      couponDiscount,
      overallDiscount
    ]);

    /* ================= TABLE HEADER ================= */

    sheet.addRow([]);

    const headerRow = sheet.addRow([
      "Order ID",
      "Customer",
      "Payment",
      "Amount",
      "Discount",
      "Total",
      "Date"
    ]);

    headerRow.font = { bold: true };

    headerRow.eachCell(cell => {
      cell.border = {
        top:    { style: "thin" },
        left:   { style: "thin" },
        bottom: { style: "thin" },
        right:  { style: "thin" }
      };
    });

    orders.forEach(order => {

      const discount =
        order.orderSummary.discount +
        order.orderSummary.coupon;

      const row = sheet.addRow([
        order._id.toString().slice(-6),
        order.userId?.name || "User",
        order.paymentMethod,
        order.orderSummary.subTotal,
        discount,
        order.orderSummary.total,
        new Date(order.createdAt)
          .toLocaleDateString()
      ]);

      row.eachCell(cell => {
        cell.border = {
          top:    { style: "thin" },
          left:   { style: "thin" },
          bottom: { style: "thin" },
          right:  { style: "thin" }
        };
      });

    });


    sheet.columns.forEach(column => {
      column.width = 18;
    });


    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {
    console.error(error);
  }
};

const getRevenueChart = async (req, res) => {

  const { frequency = "monthly" } = req.query;

  let groupFormat;
  let startDate = new Date();

  switch (frequency) {

    case "daily":
      startDate.setHours(0,0,0,0);
      groupFormat = "%Y-%m-%d";
      break;

    case "weekly":
      startDate.setDate(startDate.getDate() - 7);
      groupFormat = "%G-%V";
      break;

    case "monthly":
      startDate.setMonth(startDate.getMonth() - 1);
      groupFormat = "%Y-%m";
      break;

    case "yearly":
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupFormat = "%Y";
      break;
  }

  const chartData = await Order.aggregate([
    {
      $match: {
        status: "delivered",
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString:{
            format: groupFormat,
            date: "$createdAt"
          }
        },
        revenue:{
          $sum:{ $toDouble:"$orderSummary.total" }
        },
        orders:{ $sum:1 }
      }
    },
    { $sort:{ _id:1 } }
  ]);


  const summary = await Order.aggregate([
    {
      $match:{
        status:"delivered",
        createdAt:{ $gte:startDate }
      }
    },
    {
      $group:{
        _id:null,
        totalRevenue:{
          $sum:{ $toDouble:"$orderSummary.total" }
        },
        totalSales:{ $sum:1 }
      }
    }
  ]);

  const usersCount = await User.countDocuments();

  res.json({
    chartData,
    totalRevenue: summary[0]?.totalRevenue || 0,
    totalSales: summary[0]?.totalSales || 0,
    usersCount
  });
};

const getTopProducts = async (req,res)=>{

  try{

    const { frequency="monthly" } = req.query;

    let startDate = new Date();


    switch(frequency){

      case "daily":
        startDate.setHours(0,0,0,0);
        break;

      case "weekly":
        startDate.setDate(startDate.getDate()-7);
        break;

      case "monthly":
        startDate.setMonth(startDate.getMonth()-1);
        break;

      case "yearly":
        startDate.setFullYear(startDate.getFullYear()-1);
        break;
    }

    const products = await Order.aggregate([

      {
        $match:{
          status:"delivered",
          createdAt:{ $gte:startDate }
        }
      },

      { $unwind:"$orderItems" },

      {
        $lookup:{
          from:"products",
          localField:"orderItems.product",
          foreignField:"_id",
          as:"productData"
        }
      },

      { $unwind:"$productData" },

      {
        $group:{
          _id:"$productData.name",
          totalSold:{
            $sum:"$orderItems.quantity"
          }
        }
      },

      { $sort:{ totalSold:-1 } },

      { $limit:5 }

    ]);
    
    const totalQty =
      products.reduce(
        (sum,p)=>sum+p.totalSold,0
      );

    const result = products.map(p=>({
      name:p._id,
      percentage:
        ((p.totalSold/totalQty)*100)
        .toFixed(2)
    }));

    console.log(result)
    res.json(result);

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Server error"});
  }
};


export default {loadAnalytics,postAnalytics,exportPDF,exportExcel,getRevenueChart,getTopProducts}