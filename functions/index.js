/* eslint-disable max-len */
const {onValueCreated} = require("firebase-functions/v2/database");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

// Inicializar Firebase Admin
initializeApp();

exports.syncNotificationToFirestore = onValueCreated("/test/{pushId}", async (event) => {
  const data = event.data.val();

  if (!data) {
    logger.warn("No data found in Realtime Database snapshot.");
    return;
  }

  const firestore = getFirestore();

  try {
    await firestore.collection("alertas").add({
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) :
      FieldValue.serverTimestamp(),
    });

    // Borra el nodo original en Realtime Database después de guardarlo
    await event.data.ref.remove();

    logger.info("Notificación guardada y eliminada de Realtime Database.");
  } catch (error) {
    logger.error("Error al guardar notificación:", error);
  }
});
