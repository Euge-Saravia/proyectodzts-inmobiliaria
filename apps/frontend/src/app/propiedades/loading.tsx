export default function PropiedadesLoading() {
  return (
    <main className="container-fluid px-3 px-lg-4 py-4 py-md-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <div className="placeholder-glow">
          <span className="placeholder col-3"></span>
        </div>
      </nav>
      <h1 className="text-center mb-4 fw-bold">Propiedades</h1>

      <div className="row g-4">
        {/* Filter sidebar skeleton - desktop only */}
        <div className="d-none d-lg-block col-lg-3">
          <div className="bg-light rounded-3 p-3">
            <div className="placeholder-glow mb-3">
              <span className="placeholder col-4"></span>
            </div>
            <div className="placeholder-glow mb-3">
              <span className="placeholder col-6 d-block mb-2"></span>
              <span className="placeholder col-8 d-block mb-2"></span>
              <span className="placeholder col-7 d-block"></span>
            </div>
            <div className="placeholder-glow mb-3">
              <span className="placeholder col-7 d-block mb-2"></span>
              <span className="placeholder col-9 d-block mb-2"></span>
              <span className="placeholder col-6 d-block"></span>
            </div>
            <div className="placeholder-glow mb-3">
              <span className="placeholder col-5 d-block mb-2"></span>
              <span className="placeholder col-8 d-block mb-2"></span>
              <span className="placeholder col-6 d-block"></span>
            </div>
            <div className="placeholder-glow mb-4">
              <span className="placeholder col-4 d-block mb-2"></span>
              <span className="placeholder col-7 d-block mb-2"></span>
              <span className="placeholder col-6 d-block"></span>
            </div>
            <div className="placeholder-glow">
              <span className="placeholder w-100 d-block mb-2" style={{ height: 40 }}></span>
              <span className="placeholder w-100 d-block" style={{ height: 40 }}></span>
            </div>
          </div>
        </div>

        {/* Mobile filter toggle skeleton */}
        <div className="d-lg-none col-12">
          <div className="placeholder-glow mb-4">
            <span className="placeholder w-100 d-block" style={{ height: 44 }}></span>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="col-12 col-lg-9">
          <div className="d-flex flex-wrap gap-2 mb-3 placeholder-glow">
            <span className="placeholder rounded-pill" style={{ width: 80, height: 26 }}></span>
            <span className="placeholder rounded-pill" style={{ width: 110, height: 26 }}></span>
            <span className="placeholder rounded-pill" style={{ width: 90, height: 26 }}></span>
          </div>
          <div className="mb-3 placeholder-glow">
            <span className="placeholder col-4"></span>
          </div>

          <div className="row g-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="col-12 col-sm-6 col-xl-4 d-flex justify-content-center"
              >
                <div className="card shadow-sm rounded-4 border-0" style={{ width: 400 }}>
                  <div
                    className="card-img-top rounded-top-4 placeholder-glow bg-light"
                    style={{ height: 220 }}
                  />
                  <div className="w-100 bg-primary" style={{ height: 4 }} />
                  <div className="card-body text-center pb-2 placeholder-glow">
                    <h5 className="fw-bold mb-2">
                      <span className="placeholder col-8"></span>
                    </h5>
                    <p className="mb-2">
                      <span className="placeholder col-5"></span>
                    </p>
                    <p className="mb-3">
                      <span className="placeholder col-6"></span>
                    </p>
                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                      <span className="placeholder col-2"></span>
                      <span className="placeholder col-4"></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
