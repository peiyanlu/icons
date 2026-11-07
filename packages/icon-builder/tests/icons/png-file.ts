import sharp from 'sharp'


export const createTestPNG = async (alpha = 1): Promise<Buffer<ArrayBuffer>> => {
  return sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: {
        r: 255,
        g: 0,
        b: 0,
        alpha,
      },
    },
  })
    .png()
    .toBuffer()
}
