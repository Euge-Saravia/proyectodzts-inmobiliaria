export default function PropertyLoading() {
  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <nav aria-label="breadcrumb" className="mb-3">
              <div className="placeholder-glow">
                <span className="placeholder col-4"></span>
              </div>
            </nav>

            <div className="placeholder-glow mb-2">
              <span className="placeholder col-7"></span>
            </div>
            <div className="d-flex gap-2 mb-2 placeholder-glow">
              <span className="placeholder rounded-pill" style={{ width: 90, height: 28 }}></span>
              <span className="placeholder rounded-pill" style={{ width: 120, height: 28 }}></span>
            </div>

            <div className="placeholder-glow mb-3">
              <span className="placeholder col-8 d-block mb-2"></span>
              <span className="placeholder col-6 d-block"></span>
            </div>
            <hr className="border-primary mb-4" />

            <div className="carousel-image-container position-relative mb-4">
              <div className="placeholder-glow bg-light rounded-3 w-100 h-100">
                <span className="placeholder w-100 h-100 d-block"></span>
              </div>
            </div>

            <div className="placeholder-glow mb-5">
              <span className="placeholder col-12 d-block mb-2"></span>
              <span className="placeholder col-11 d-block mb-2"></span>
              <span className="placeholder col-10 d-block mb-2"></span>
              <span className="placeholder col-9 d-block"></span>
            </div>

            <hr className="border-secondary my-4" />
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 placeholder-glow">
              <span className="placeholder col-5" style={{ height: 34 }}></span>
              <span className="placeholder col-4" style={{ height: 46 }}></span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-100">
        <div className="placeholder-glow bg-light" style={{ width: "100%", height: "450px" }}>
          <span className="placeholder w-100 h-100 d-block"></span>
        </div>
      </div>
    </>
  );
}
