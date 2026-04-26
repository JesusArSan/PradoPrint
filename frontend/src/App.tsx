import Perritos from './components/Perritos'
import Cuadros from './components/Cuadros'

function App() {
  return (
    <div className="min-h-screen bg-stone-50 font-montserrat text-stone-800">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">PradoPrint</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Galería aleatoria · Perritos &amp; Cuadros
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Perritos />
          <Cuadros />
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-6 text-xs text-stone-400">
        Imágenes de dog.ceo y catálogo PradoPrint
      </footer>
    </div>
  )
}

export default App
