// Shared between the project ring and the 3D world: how far the ring has turned, in radians.
// The ring writes it every frame; the world reads it so the landscape turns with the cards.
export const journey = { yaw: 0 };
