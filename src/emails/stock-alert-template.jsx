function groupByUrgency(alerts) {
  return alerts.reduce((acc, alert) => {
    if (!acc[alert.urgencyLevel]) {
      acc[alert.urgencyLevel] = [];
    }
    acc[alert.urgencyLevel].push(alert);
    return acc;
  }, {});
}

const urgencyColors = {
  CRITICAL: "#FF0000",
  HIGH: "#FF6B6B",
  MEDIUM: "#FFA500",
  LOW: "#4CAF50",
};

const urgencyIcons = {
  CRITICAL: "❗❗❗",
  HIGH: "❗❗",
  MEDIUM: "❗",
  LOW: "ℹ️",
};

export function generateEmailContent(productAlerts) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const groupedAlerts = groupByUrgency(productAlerts);

  const alertsHtml = Object.entries(groupedAlerts)
    .map(
      ([urgency, products]) => `
        <div style="margin-bottom: 30px;">
          <h2 style="
            color: ${urgencyColors[urgency]};
            background-color: ${urgencyColors[urgency]}22;
            padding: 10px;
            border-radius: 5px;
          ">
            ${urgencyIcons[urgency]} ${urgency} Priority
          </h2>
          <ul style="list-style-type: none; padding: 0;">
            ${products
              .map(
                (p) => `
              <li style="
                padding: 15px;
                margin: 10px 0;
                background-color: #ffffff;
                border-left: 4px solid ${urgencyColors[p.urgencyLevel]};
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border-radius: 0 5px 5px 0;
              ">
                <strong style="font-size: 18px;">${p.name}</strong><br />
                <span style="font-size: 14px;">
                  Current stock: <strong>${p.stockQuantity}</strong> (
                  ${Math.abs(p.stockQuantity - p.minimumStockThreshold)} 
                  ${
                    p.stockQuantity < p.minimumStockThreshold
                      ? "below"
                      : "above"
                  } threshold of ${p.minimumStockThreshold})
                </span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Stock Alert Report</title>
        </head>
        <body style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        ">
          <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          ">
            <h1 style="
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
              margin-bottom: 20px;
            ">Stock Alert Report</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">Date: <strong>${date}</strong></p>
            <p style="font-size: 16px; margin-bottom: 20px;">The following products require attention:</p>
            
            ${alertsHtml}
            
            <p style="
              font-size: 16px;
              background-color: #e74c3c;
              color: white;
              padding: 10px;
              border-radius: 5px;
              text-align: center;
            ">
              Please take necessary action to replenish the inventory.
            </p>
            
            <hr style="border: 1px solid #ecf0f1; margin: 30px 0;" />
            
            <footer style="
              font-size: 12px;
              color: #7f8c8d;
              text-align: center;
              margin-top: 20px;
            ">
              This is an automated message from your inventory management system.
            </footer>
          </div>
        </body>
      </html>
    `;
}
