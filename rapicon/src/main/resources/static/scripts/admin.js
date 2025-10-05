// Sample data
  const pendingDesigns = [
      {
          id: 1,
          title: "Modern Villa Paradise",
          vendor: "ABC Architects",
          email: "abc@architects.com",
          designType: "villa",
          price: 1850,
          bedrooms: 4,
          bathrooms: 3,
          area: "3200 sq ft",
          uploadDate: "2024-01-20",
          status: "pending",
          description: "Luxurious modern villa with contemporary design features",
          icon: "🏡"
      },
      {
          id: 2,
          title: "Cozy Farmhouse Design",
          vendor: "Rural Designs Co",
          email: "rural@designs.com",
          designType: "farmhouse",
          price: 1200,
          bedrooms: 3,
          bathrooms: 2,
          area: "2400 sq ft",
          uploadDate: "2024-01-18",
          status: "pending",
          description: "Traditional farmhouse with modern amenities",
          icon: "🏚️"
      },
      {
          id: 3,
          title: "Executive Apartment",
          vendor: "City Living Designs",
          email: "city@living.com",
          designType: "apartment",
          price: 680,
          bedrooms: 2,
          bathrooms: 2,
          area: "1200 sq ft",
          uploadDate: "2024-01-19",
          status: "approved",
          description: "Modern apartment perfect for urban professionals",
          icon: "🏢"
      }
  ];

  const vendors = [
      {
          id: 1,
          name: "ABC Architects",
          email: "abc@architects.com",
          designs: 24,
          sales: 156,
          rating: 4.8,
          joinDate: "2023-01-15",
          status: "active",
          totalEarnings: 12450
      },
      {
          id: 2,
          name: "Rural Designs Co",
          email: "rural@designs.com",
          designs: 12,
          sales: 89,
          rating: 4.6,
          joinDate: "2023-03-20",
          status: "active",
          totalEarnings: 8960
      },
      {
          id: 3,
          name: "City Living Designs",
          email: "city@living.com",
          designs: 18,
          sales: 134,
          rating: 4.7,
          joinDate: "2023-02-10",
          status: "inactive",
          totalEarnings: 15680
      }
  ];

  const users = [
      {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          purchases: 5,
          totalSpent: 2340,
          joinDate: "2023-06-15",
          status: "active"
      },
      {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          purchases: 12,
          totalSpent: 5680,
          joinDate: "2023-04-20",
          status: "active"
      },
      {
          id: 3,
          name: "Bob Johnson",
          email: "bob@example.com",
          purchases: 3,
          totalSpent: 890,
          joinDate: "2023-08-10",
          status: "suspended"
      }
  ];

  let currentDesign = null;
  let designsList=[];
  let vendorList=[];
  let userList=[];
  let orderList=[];

  // Initialize dashboard
  document.addEventListener('DOMContentLoaded', function() {

      const fullName= localStorage.getItem("fullName") || "Guest";
      document.getElementById("welcomeAdmin").textContent= `Welcome, ${fullName}`;
      renderDesignsTable();
      renderVendorsTable();
      renderUsersTable();
      renderOrdersTable();
      renderRecentActivity();
      setupEventListeners();
  });

  function setupEventListeners() {
      // Search and filter functionality
      document.getElementById('designSearch').addEventListener('input', filterDesigns);
      document.getElementById('designStatusFilter').addEventListener('change', filterDesigns);
      document.getElementById('designTypeFilter').addEventListener('change', filterDesigns);

      document.getElementById('vendorSearch').addEventListener('input', filterVendors);
      document.getElementById('vendorStatusFilter').addEventListener('change', filterVendors);

      document.getElementById('userSearch').addEventListener('input', filterUsers);
      document.getElementById('userStatusFilter').addEventListener('change', filterUsers);

      document.getElementById('orderSearch').addEventListener('input', filterOrders);
      document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);


      // Modal close functionality
      window.addEventListener('click', function(event) {
          const modal = document.getElementById('designModal');
          if (event.target === modal) {
              closeModal();
          }
      });
  }

  function switchTab(tabName) {
      // Remove active class from all tabs and content
      document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      event.target.classList.add('active');
      document.getElementById(tabName).classList.add('active');
  }

  async function renderDesignsTable() {
      const tbody = document.getElementById('designsTableBody');
      tbody.innerHTML = '';

      const token= localStorage.getItem('token');
      const response= await fetch('/api/admin/all',
            {
                method: 'GET',
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            });
      designsList= await response.json();

      designsList.forEach(design => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="font-size: 1.5rem;">${getDesignIcon(design.designType)}</span>
                      <div>
                          <div style="font-weight: 600; color: #2d3748;">${design.title}</div>
                          <div style="font-size: 0.85rem; color: #718096;">${design.area}, ${design.bedrooms}BR/${design.bathrooms}BA</div>
                      </div>
                  </div>
              </td>
              <td>
                  <div>
                      <div style="font-weight: 600; color: #2d3748;">${design.vendor.firstname} ${design.vendor.lastname}</div>
                      <div style="font-size: 0.85rem; color: #718096;">${design.vendor.email}</div>
                  </div>
              </td>
              <td><span class="design-type" style="background: linear-gradient(45deg, #1e3c72, #2a5298); color: white; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;">${design.designType.toUpperCase()}</span></td>
              <td><strong>${design.price}</strong></td>
              <td>${new Date(design.uploadDate).toLocaleDateString('en-GB')}</td>
              <td><span class="status-badge status-${design.status.toLowerCase()}">${design.status}</span></td>
              <td>
                  <div class="action-buttons">
                      <button class="action-btn view-btn" onclick="viewDesign(${design.id})">👁️ View</button>
                      ${design.status === 'pending' ? `
                          <button class="action-btn approve-btn" onclick="quickApprove(${design.id})">✅ Approve</button>
                          <button class="action-btn reject-btn" onclick="quickReject(${design.id})">❌ Reject</button>
                      ` : ''}
                      <button class="action-btn delete-btn" onclick="deleteDesign(${design.id})">🗑️ Delete</button>
                  </div>
              </td>
          `;
          tbody.appendChild(row);
      });
  }

  async function renderVendorsTable() {
      const tbody = document.getElementById('vendorsTableBody');
      tbody.innerHTML = '';

      const token= localStorage.getItem('token');
      const response= await fetch("/api/admin/users?role=VENDOR",
      {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
      });

      if(!response.ok){
        throw new Error("Failed to fetch vendors");
      }
      vendorList= await response.json();
      vendorList.forEach(vendor => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(45deg, #1e3c72, #2a5298); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${vendor.firstname.charAt(0)}</div>
                      <div>
                          <div style="font-weight: 600; color: #2d3748;">${vendor.firstname} ${vendor.lastname}</div>
                      </div>
                  </div>
              </td>
              <td>${vendor.email}</td>
              <td><strong>12</strong> designs</td>
              <td><strong>25</strong> sales</td>
              <td>⭐ 4.5/5.0</td>
              <td>${new Date().toLocaleDateString()}</td>
              <td><span class="status-badge status-${vendor.phone}">${vendor.phone}</span></td>
              <td>
                  <div class="action-buttons">
                      <button class="action-btn view-btn" onclick="viewVendor(${vendor.id})">👁️ View</button>
                      <button class="action-btn edit-btn" onclick="editVendor(${vendor.id})">✏️ Edit</button>
                      ${vendor.status === 'active' ?
                          `<button class="action-btn reject-btn" onclick="suspendVendor(${vendor.id})">⏸️ Suspend</button>` :
                          `<button class="action-btn approve-btn" onclick="activateVendor(${vendor.id})">✅ Activate</button>`
                      }
                  </div>
              </td>
          `;
          tbody.appendChild(row);
      });
  }

  async function renderUsersTable() {
      const tbody = document.getElementById('usersTableBody');
      tbody.innerHTML = '';

      const token= localStorage.getItem('token');
      const response= await fetch("/api/admin/users?role=USER",
      {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
      });

      if(!response.ok){
         throw new Error("Failed to fetch users");
      }
      userList= await response.json();

      userList.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(45deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${user.firstname.charAt(0)}</div>
                      <div>
                          <div style="font-weight: 600; color: #2d3748;">${user.firstname} ${user.lastname}</div>
                      </div>
                  </div>
              </td>
              <td>${user.email}</td>
              <td><strong>15</strong></td>
              <td><strong>2300</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
              <td><span class="status-badge status-${user.phone}">${user.phone}</span></td>
              <td>
                  <div class="action-buttons">
                      <button class="action-btn view-btn" onclick="viewUser(${user.id})">👁️ View</button>
                      <button class="action-btn edit-btn" onclick="editUser(${user.id})">✏️ Edit</button>
                      ${user.status === 'active' ?
                          `<button class="action-btn reject-btn" onclick="suspendUser(${user.id})">⏸️ Suspend</button>` :
                          `<button class="action-btn approve-btn" onclick="activateUser(${user.id})">✅ Activate</button>`
                      }
                  </div>
              </td>
          `;
          tbody.appendChild(row);
      });
  }

  async function renderOrdersTable() {
      const tbody = document.getElementById('ordersTableBody');
      tbody.innerHTML = '';

      const token = localStorage.getItem('token');

      try {
          const response = await fetch("/api/admin/orders", {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) throw new Error("Failed to fetch orders");

          orderList = await response.json();

          orderList.forEach(order => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${order.customerName || 'N/A'}</td>
                  <td>${order.customerEmail || 'N/A'}</td>
                  <td>${order.customerPhone || 'N/A'}</td>
                  <td>${order.designName || 'N/A'}</td>
                  <td>${order.price || 0}</td>
                  <td>${order.paymentMethod || 'N/A'}</td>
                  <td>${order.projectLocation || 'N/A'}</td>
              `;
              tbody.appendChild(row);
          });

      } catch (error) {
          console.error("Error fetching orders:", error);
      }
  }


  function renderRecentActivity() {
      const container = document.getElementById('recentActivity');
      const activities = [
          "🏠 New design 'Modern Villa Paradise' submitted by ABC Architects",
          "👥 New user 'John Doe' registered",
          "💰 Payment of $1,850 processed for Villa design",
          "🏢 Vendor 'Rural Designs Co' updated their profile",
          "✅ Design 'Executive Apartment' approved and published",
      ];

      container.innerHTML = activities.map(activity => `
          <div style="padding: 15px; border-left: 4px solid #1e3c72; background: #f8fafc; margin-bottom: 10px; border-radius: 0 8px 8px 0;">
              ${activity}
          </div>
      `).join('');
  }

  function viewDesign(designId) {
      const design = designsList.find(d => d.id === designId);
      if (!design) return;

      currentDesign = design;

      document.getElementById('modalDesignImage').innerHTML = getDesignIcon(design.designType);
      document.getElementById('modalDesignDetails').innerHTML = `
          <div class="detail-item">
              <span class="detail-label">Design Name:</span>
              <span class="detail-value">${design.title}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Vendor:</span>
              <span class="detail-value">${design.vendor.firstname} ${design.vendor.lastname}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${design.designType}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Price:</span>
              <span class="detail-value">${design.price}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Bedrooms:</span>
              <span class="detail-value">${design.bedrooms}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Bathrooms:</span>
              <span class="detail-value">${design.bathrooms}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Area:</span>
              <span class="detail-value">${design.area}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Upload Date:</span>
              <span class="detail-value">${new Date(design.uploadDate).toLocaleDateString('en-GB')}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value"><span class="status-badge status-${design.status.toLowerCase()}">${design.status}</span></span>
          </div>
          <div style="margin-top: 20px;">
              <div class="detail-label">Description:</div>
              <div style="color: #2d3748; margin-top: 8px; line-height: 1.5;">${design.description}</div>
          </div>
      `;

      document.getElementById('designModal').style.display = 'block';
  }

  function closeModal() {
      document.getElementById('designModal').style.display = 'none';
      document.getElementById('reviewComment').value = '';
      currentDesign = null;
  }

  async function approveDesign() {
    const jwtToken = localStorage.getItem('token'); // get token from login storage
    if (!jwtToken) {
      alert("You must be logged in as admin to approve a design.");
      return;
    }

    const comment = document.getElementById("reviewComment").value;

    try {
      const response = await fetch(`/api/admin/update?id=${currentDesign.id}&status=approved`,
      {
        method: 'PUT',
        headers:{
            'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (response.ok) {
        alert("✅ Design approved successfully!");
        closeModal();
        renderDesignsTable(); // refresh list
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`❌ Failed to approve design: ${err.message || response.status}`);
      }
    } catch (error) {
      console.error("Error approving design:", error);
      alert("⚠️ Error approving design. See console for details.");
    }
  }

  async function rejectDesign() {
      if (!currentDesign) return;

      const comment = document.getElementById('reviewComment').value;
      const token= localStorage.getItem('token');
      try{
            const response = await fetch(`/api/admin/update?id=${currentDesign.id}&status=rejected`,
            {
                method: 'PUT',
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                 alert("✅ Design rejected successfully!");
                 closeModal();
                 renderDesignsTable(); // refresh list
            } else {
                 const err = await response.json().catch(() => ({}));
                 alert(`❌ Failed to approve design: ${err.message || response.status}`);
            }
      }catch{
          console.error("Error rejecting design:", error);
          alert("⚠️ Error rejected design. See console for details.");
      }
  }

  function quickApprove(designId) {
      if (confirm('Are you sure you want to approve this design?')) {
          const design = pendingDesigns.find(d => d.id === designId);
          if (design) {
              design.status = 'approved';
              renderDesignsTable();
              showNotification('✅ Design approved successfully!', 'success');
          }
      }
  }

  function quickReject(designId) {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason && reason.trim()) {
          const design = pendingDesigns.find(d => d.id === designId);
          if (design) {
              design.status = 'rejected';
              renderDesignsTable();
              showNotification('❌ Design rejected with feedback sent to vendor', 'error');
          }
      }
  }

  function deleteDesign(designId) {
    if (confirm('Are you sure you want to permanently delete this design? This action cannot be undone.')) {
            // Call backend API
            fetch(`/api/admin/delete?id=${designId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // include JWT if needed
                }
            })
            .then(response => {
                if (response.ok) {
                    // Remove from local array
                    const index = designsList.findIndex(d => d.id === designId);
                    if (index !== -1) {
                        designsList.splice(index, 1);
                        renderDesignsTable();
                        showNotification('🗑️ Design deleted permanently', 'success');
                    }
                } else {
                    showNotification('❌ Failed to delete design', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showNotification('❌ Error deleting design', 'error');
            });
    }
  }

  function suspendVendor(vendorId) {
      if (confirm('Are you sure you want to suspend this vendor? They will not be able to upload new designs.')) {
          const vendor = vendors.find(v => v.id === vendorId);
          if (vendor) {
              vendor.status = 'inactive';
              renderVendorsTable();
              showNotification('⏸️ Vendor suspended successfully', 'warning');
          }
      }
  }

  function activateVendor(vendorId) {
      const vendor = vendors.find(v => v.id === vendorId);
      if (vendor) {
          vendor.status = 'active';
          renderVendorsTable();
          showNotification('✅ Vendor activated successfully', 'success');
      }
  }

  function suspendUser(userId) {
      if (confirm('Are you sure you want to suspend this user? They will not be able to make purchases.')) {
          const user = users.find(u => u.id === userId);
          if (user) {
              user.status = 'suspended';
              renderUsersTable();
              showNotification('⏸️ User suspended successfully', 'warning');
          }
      }
  }

  function activateUser(userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
          user.status = 'active';
          renderUsersTable();
          showNotification('✅ User activated successfully', 'success');
      }
  }

  // Filter functions
  function filterDesigns() {
      // Implementation for filtering designs table
      renderDesignsTable();
  }

  function filterVendors() {
      // Implementation for filtering vendors table
      renderVendorsTable();
  }

  function filterUsers() {
      // Implementation for filtering users table
      renderUsersTable();
  }

  function filterOrders() {
        // Implementation for filtering users table
        renderOrdersTable();
    }

  // Placeholder functions for additional actions
  function viewVendor(vendorId) {
      showNotification('👁️ Vendor profile view - Feature coming soon', 'success');
  }

  function editVendor(vendorId) {
      showNotification('✏️ Vendor edit - Feature coming soon', 'success');
  }

  function viewUser(userId) {
      showNotification('👁️ User profile view - Feature coming soon', 'success');
  }

  function editUser(userId) {
      showNotification('✏️ User edit - Feature coming soon', 'success');
  }

  function showNotification(message, type) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type} show`;

      setTimeout(() => {
          notification.classList.remove('show');
      }, 4000);
  }

  // get icon method
  function getDesignIcon(type) {
       const icons = { HOUSE: '🏠', VILLA: '🏡', APARTMENT: '🏢', FORM_HOUSE: '🏚️', ROW_HOUSE: '🏘️', DUPLEX: '🏰', COMMERCIAL: '🏢' };
       return icons[type] || '🏠';
   }