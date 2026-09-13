const showNotification = (message, type = "info", icon = "ℹ️") => {
  const panel = getElement("notificationPanel");
  const text = getElement("notificationText");
  const notificationIcon = getElement("notificationIcon");

  text.textContent = message;
  notificationIcon.textContent = icon;

  panel.classList.remove("hidden", "success", "warning");

  if (type === "success") {
    panel.classList.add("success");
  }

  if (type === "warning") {
    panel.classList.add("warning");
  }
};

const closeNotification = () => {
  getElement("notificationPanel").classList.add("hidden");
};

const updateNotificationPermissionText = () => {
  const text = getElement("notificationPermissionText");

  if (!("Notification" in window)) {
    text.textContent =
      "This browser does not support phone notifications.";
    return;
  }

  if (Notification.permission === "granted") {
    text.textContent = "Notifications are enabled for this website.";
  } else if (Notification.permission === "denied") {
    text.textContent =
      "Notifications are blocked. Enable them in your browser site settings.";
  } else {
    text.textContent =
      "Press the button to allow Civic Ledger notifications.";
  }
};

const enablePhoneNotifications = async () => {
  if (!("Notification" in window)) {
    showNotification(
      "Your browser does not support phone notifications.",
      "warning",
      "⚠️"
    );
    return;
  }

  const permission = await Notification.requestPermission();

  updateNotificationPermissionText();

  if (permission === "granted") {
    showNotification(
      "Notifications are now enabled for Civic Ledger.",
      "success",
      "✅"
    );

    new Notification("Civic Ledger", {
      body: "Notifications have been enabled successfully."
    });
  } else if (permission === "denied") {
    showNotification(
      "Notifications were blocked. You can enable them in browser settings.",
      "warning",
      "⚠️"
    );
  } else {
    showNotification(
      "Notifications were not enabled.",
      "warning",
      "ℹ️"
    );
  }
};

const sendBrowserNotification = (title, message) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "icon-192.png"
    });
  }
};

getElement("closeNotification").addEventListener(
  "click",
  closeNotification
);

getElement("enableNotificationsButton").addEventListener(
  "click",
  enablePhoneNotifications
);

updateNotificationPermissionText();

getElement("auditButton").addEventListener("click", () => {
  const audit = getAuditData();

  displayAudit(audit);

  showNotification(
    "Your wage audit is ready to review.",
    "success",
    "✅"
  );

  sendBrowserNotification(
    "Civic Ledger audit ready",
    "Your estimated wage result is ready to review."
  );
});
showNotification(
  "Your audit was saved on this device.",
  "success",
  "💾"
);

sendBrowserNotification(
  "Civic Ledger audit saved",
  "Your audit was saved locally on this device."
);
