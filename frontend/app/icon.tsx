import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "#176b50",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4dc4d",
          borderRadius: "6px",
          fontWeight: 900,
          border: "2px solid #18221f",
          fontFamily: "sans-serif",
        }}
      >
        K
      </div>
    ),
    {
      ...size,
    }
  );
}
