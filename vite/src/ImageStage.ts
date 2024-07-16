import Konva from "konva";

export default class ImageStage {
  stage;
  layer;
  projections: Konva.Image[] = [];
  displayedProjection?: Konva.Image;
  croppingRectangle;
  resizeObserver;

  constructor(containerId: string) {
    this.stage = new Konva.Stage({ container: containerId });

    this.layer = new Konva.Layer({ imageSmoothingEnabled: false });
    this.stage.add(this.layer);

    this.croppingRectangle = new Konva.Rect({
      width: 10,
      height: 10,
      offsetX: 5,
      offsetY: 5,
      stroke: "lightblue",
      strokeWidth: 1,
      strokeScaleEnabled: false,
      draggable: true,
      fillEnabled: true,
    });
    this.croppingRectangle.on("dragmove", (e) => {
      if (this.displayedProjection === undefined) {
        console.error(
          "`this.displayedProjection` is expected to have value here.",
        );
        return;
      }

      const rect = e.target;
      const xRange = (this.displayedProjection.width() - rect.width()) / 2;
      const yRange = (this.displayedProjection.height() - rect.height()) / 2;
      rect.x(Math.min(Math.max(rect.x(), -xRange), xRange));
      rect.y(Math.min(Math.max(rect.y(), -yRange), yRange));
    });
    this.croppingRectangle.on("transform", (e) => {
      const rect = e.target;
      const newWidth = rect.width() * rect.scaleX();
      const newHeight = rect.height() * rect.scaleY();
      rect.setAttrs({
        width: newWidth,
        height: newHeight,
        offsetX: newWidth / 2,
        offsetY: newHeight / 2,
        scaleX: 1,
        scaleY: 1,
      });
    });
    this.layer.add(this.croppingRectangle);

    const transformer = new Konva.Transformer({
      rotateEnabled: false,
      borderEnabled: false,
      anchorSize: 8,
      anchorCornerRadius: 4,
      anchorStroke: "lightblue",
      keepRatio: false,
      ignoreStroke: true,
    });
    transformer.nodes([this.croppingRectangle]);
    this.layer.add(transformer);

    this.resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      this.stage.size({ width, height });
      this.layer.position({ x: width / 2, y: height / 2 });
      this.adjustScale();
    });
    this.resizeObserver.observe(this.stage.container());
  }

  async loadProjections(dataUrls: string[]) {
    for (const projection of this.projections) {
      projection.destroy();
    }
    this.projections = [];

    for (const dataUrl of dataUrls) {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      this.projections.push(
        new Konva.Image({
          image: image,
          offsetX: image.width / 2,
          offsetY: image.height / 2,
        }),
      );
    }

    this.setDisplayedProjection(0);
    this.adjustScale();
  }

  setDisplayedProjection(index: number) {
    this.displayedProjection?.remove();
    this.displayedProjection = this.projections[index];
    this.layer.add(this.displayedProjection);
    this.displayedProjection.zIndex(0);
  }

  destroy() {
    this.resizeObserver.disconnect();
    this.stage.destroy();
  }

  private adjustScale() {
    let scale;
    if (this.displayedProjection !== undefined) {
      const displayWidth = this.stage.width() - 20;
      const displayHeight = this.stage.height() - 20;
      scale = Math.min(
        displayWidth / this.displayedProjection.width(),
        displayHeight / this.displayedProjection.height(),
      );
    } else {
      scale = 1;
    }
    this.layer.scale({ x: scale, y: scale });
  }
}
