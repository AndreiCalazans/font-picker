// Fallback font catalog for when Google Fonts API is not available
export const fallbackFonts = [
  {
    id: "roboto",
    family: "Roboto",
    category: "sans-serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 400, style: "italic" },
      { weight: 700, style: "normal" },
      { weight: 700, style: "italic" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
      "400italic":
        "https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu51xIIzIXKMny.woff2",
      700: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2",
      "700italic":
        "https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBic6CsTYl4BO.woff2",
    },
    source: "google",
  },
  {
    id: "open-sans",
    family: "Open Sans",
    category: "sans-serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 400, style: "italic" },
      { weight: 600, style: "normal" },
      { weight: 700, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVIUwaEQbjB_mQ.woff2",
      "400italic":
        "https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0Rk8ZkWVAWwmEzM4jVNA.woff2",
      600: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsgH1x4gaVIUwaEQbjB_mQ.woff2",
      700: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVIUwaEQbjB_mQ.woff2",
    },
    source: "google",
  },
  {
    id: "lato",
    family: "Lato",
    category: "sans-serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 400, style: "italic" },
      { weight: 700, style: "normal" },
      { weight: 900, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.woff2",
      "400italic":
        "https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxsAUi-qNiXg7Q.woff2",
      700: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.woff2",
      900: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2",
    },
    source: "google",
  },
  {
    id: "montserrat",
    family: "Montserrat",
    category: "sans-serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 500, style: "normal" },
      { weight: 600, style: "normal" },
      { weight: 700, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Uw-.woff2",
      500: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Uw-.woff2",
      600: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu170w-.woff2",
      700: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.woff2",
    },
    source: "google",
  },
  {
    id: "source-sans-pro",
    family: "Source Sans Pro",
    category: "sans-serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 400, style: "italic" },
      { weight: 600, style: "normal" },
      { weight: 700, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/sourcesanspro/v22/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2",
      "400italic":
        "https://fonts.gstatic.com/s/sourcesanspro/v22/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPK7lqDY.woff2",
      600: "https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlxdu.woff2",
      700: "https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlxdu.woff2",
    },
    source: "google",
  },
  {
    id: "playfair-display",
    family: "Playfair Display",
    category: "serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 400, style: "italic" },
      { weight: 700, style: "normal" },
      { weight: 900, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDTbtXK-F2qO0isEw.woff2",
      "400italic":
        "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFkD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PId8vx3sBtXK-F2qC0u_Q0s.woff2",
      700: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qO0isEw.woff2",
      900: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXD5btXK-F2qO0isEw.woff2",
    },
    source: "google",
  },
  {
    id: "merriweather",
    family: "Merriweather",
    category: "serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 400, style: "italic" },
      { weight: 700, style: "normal" },
      { weight: 900, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRpX837pvjxPA.woff2",
      "400italic":
        "https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXcf_hP3hJA.woff2",
      700: "https://fonts.gstatic.com/s/merriweather/v30/u-4i0qyriQwlOrhSvowK_l5-eSZJdeP3r-DJ7A.woff2",
      900: "https://fonts.gstatic.com/s/merriweather/v30/u-4i0qyriQwlOrhSvowK_l5-eSZxdOP3r-DJ7A.woff2",
    },
    source: "google",
  },
  {
    id: "poppins",
    family: "Poppins",
    category: "sans-serif",
    variants: [
      { weight: 400, style: "normal" },
      { weight: 500, style: "normal" },
      { weight: 600, style: "normal" },
      { weight: 700, style: "normal" },
    ],
    files: {
      400: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2",
      500: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2",
      600: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2",
      700: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2",
    },
    source: "google",
  },
];
