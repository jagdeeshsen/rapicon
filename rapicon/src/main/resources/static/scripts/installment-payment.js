document.addEventListener("DOMContentLoaded", fetchOrder);
let orders=[];

 async function fetchOrder(){
    const userId= localStorage.getItem('user_id');
    const token= localStorage.getItem('user_token');

    try{
        const response= await fetch(`/api/orders/fetch-user-order/${userId}`,{
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            throw new Error("Failed to fetch orders");
        }else{
            const data= await response.json();
            orders= data;
            render();
        }
    }catch(error){
        console.log("Error", error);
    }
 }

      var ordersData = [
         {
             id: 1,
             orderNumber: "238868a6",
             createdAt: "14 Nov 2025",
             orderStatus: "COMPLETED",
             paymentStatus: "COMPLETED",
             totalAmount: 23600,
             paidAmount: 2360,
             installmentAmount: 2360,
             totalInstallments: 10,
             customerName: "Rajesh Kumar",
             customerPhone: "7489203516",
             customerEmail: "rajesh@rapicon.com",
             items: [
                 { name: "Premium Laptop", quantity: 1, price: 23600 }
             ],
             installments: [
                 { id: 1, dueDate: "14 Dec 2025", amount: 2360, status: "PAID" },
                 { id: 2, dueDate: "14 Jan 2026", amount: 2360, status: "PENDING" },
                 { id: 3, dueDate: "14 Feb 2026", amount: 2360, status: "PENDING" },
                 { id: 4, dueDate: "14 Mar 2026", amount: 2360, status: "PENDING" },
                 { id: 5, dueDate: "14 Apr 2026", amount: 2360, status: "PENDING" },
                 { id: 6, dueDate: "14 May 2026", amount: 2360, status: "PENDING" },
                 { id: 7, dueDate: "14 Jun 2026", amount: 2360, status: "PENDING" },
                 { id: 8, dueDate: "14 Jul 2026", amount: 2360, status: "PENDING" },
                 { id: 9, dueDate: "14 Aug 2026", amount: 2360, status: "PENDING" },
                 { id: 10, dueDate: "14 Sep 2026", amount: 2360, status: "PENDING" }
             ]
         }
     ];
     function formatMoney(amount) {
         if (amount === undefined || amount === null) return "Rs. 0";

         const num = Number(amount);  // Convert BigDecimal string to number safely

         if (isNaN(num)) return "Rs. 0";  // avoid crashes

         return "Rs. " + num.toLocaleString("en-IN");  // Indian currency format
     }

     function toggle(id) {
         var el = document.getElementById("inst-" + id);
         if (el.classList.contains("show")) {
             el.classList.remove("show");
         } else {
             el.classList.add("show");
         }
     }

     function render() {
         var container = document.getElementById("orders");
         var html = "";

         for (var i = 0; i < orders.length; i++) {
             var order = orders[i];
             var paidCount = 0;

             // formate date and time
             const date= order.createdAt.split("T")[0];
             const time= order.createdAt.split("T")[1].split(".")[0]

             for (var j = 0; j < order.installmentsList.length; j++) {
                 if (order.installmentsList[j].installmentStatus === "PAID") {
                     paidCount++;
                 }
             }

             html += '<div class="order-card">';
             html += '<div class="order-header">';
             html += '<div>';
             html += '<div class="order-number">Order #' + order.orderNumber + '</div>';
             html += '<div style="color: #666; font-size: 14px;">Placed on ' + date + " " + time + '</div>';
             html += '</div>';
             html += '<div>';
             html += '<span class="badge badge-green">' + order.orderStatus + '</span>';
             html += '<span class="badge badge-green">' + order.paymentStatus + '</span>';
             html += '</div>';
             html += '</div>';

             html += '<div class="order-info">';
             html += '<div class="info-box">';
             html += '<h3>Customer</h3>';
             html += '<p><strong>' + order.user.fullName + '</strong></p>';
             html += '<p>' + order.user.phone + '</p>';
             html += '<p>' + order.user.email + '</p>';
             html += '</div>';

             html += '<div class="info-box">';
             html += '<h3>Payment</h3>';
             html += '<p>Total: ' + formatMoney(order.totalAmount) + '</p>';
             html += '<p>Paid: ' + formatMoney(order.paidAmount) + '</p>';
             html += '<p>' + formatMoney(order.installmentAmount) + '/month x ' + order.totalInstallments + ' months</p>';
             html += '</div>';

             html += '<div class="info-box">';
             html += '<h3>Items</h3>';
             for (var k = 0; k < order.ordertemList.length; k++) {
                 html += '<p>' + order.ordertemList[k].packageName + '</p>';
                 html += '<p>Qty: ' + order.ordertemList.length + ' x ' + formatMoney(order.ordertemList[k].totalAmount) + '</p>';
             }
             html += '</div>';
             html += '</div>';

             html += '<button class="toggle-btn" onclick="toggle(' + order.id + ')">';
             html += 'Installment Schedule (' + paidCount + '/' + order.totalInstallments + ' paid) ▼';
             html += '</button>';

             html += '<div id="inst-' + order.id + '" class="installments">';
             for (var m = 0; m < order.installmentsList.length; m++) {
                 var inst = order.installmentsList[m];
                 var badgeClass = inst.installmentStatus === "PAID" ? "badge-green" : "badge-yellow";
                 html += '<div class="installment-item">';
                 html += '<div><span>#' + inst.id + '</span> <span style="margin-left: 10px;">Due: ' + inst.dueDate + '</span></div>';
                 html += '<div><span style="margin-right: 10px;">' + formatMoney(inst.installmentAmount) + '</span>';
                 html += '<span class="badge ' + badgeClass + '">' + inst.installmentStatus + '</span></div>';
                 html += '</div>';
             }
             html += '</div>';

             html += '</div>';
         }

         container.innerHTML = html;
     }
