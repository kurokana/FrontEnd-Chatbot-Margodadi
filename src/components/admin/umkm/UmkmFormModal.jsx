import React, { useState, useEffect } from 'react'

/**
 * Automatically compress and scale down high-resolution images
 * so that they stay well below PHP's upload_max_filesize (2MB)
 * while maintaining excellent crisp visual quality.
 */
const compressImageFile = (file, maxDimension = 1600, quality = 0.82) => {
  return new Promise((resolve) => {
    // If file is already small (< 1MB) and is jpg/png, return as-is
    if (file.size <= 1024 * 1024) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const safeName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
              const compressedFile = new File([blob], safeName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

export default function UmkmFormModal({
  isOpen,
  onClose,
  onSubmit,
  umkmData = null,
  categories = [],
  isLoading = false,
}) {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'contact' | 'legal' | 'media' | 'products'

  // Tab 1: Profile & Core Identity
  const [name, setName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [description, setDescription] = useState('')
  const [history, setHistory] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  // Tab 2: Contact & Location
  const [phone, setPhone] = useState('')
  const [waNumber, setWaNumber] = useState('')
  const [address, setAddress] = useState('')
  const [mapTitle, setMapTitle] = useState('')
  const [mapUrl, setMapUrl] = useState('')

  // Tab 3: Legal & Capacity
  const [legalCertification, setLegalCertification] = useState('')
  const [legalNumber, setLegalNumber] = useState('')
  const [productionCapacity, setProductionCapacity] = useState('')
  const [capacityNote, setCapacityNote] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupLocation, setGroupLocation] = useState('')

  // Tab 4: Physical Media (png, jpg, jpeg only)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([])
  const [isProcessingBanner, setIsProcessingBanner] = useState(false)
  const [isProcessingGallery, setIsProcessingGallery] = useState(false)

  // Tab 5: Products Repeater
  const [products, setProducts] = useState([
    { name: '', price: '', description: '', is_active: true },
  ])

  // Error validation state
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (umkmData) {
      setName(umkmData.name || '')
      setOwnerName(umkmData.owner_name || '')
      setCategoryId(String(umkmData.category_id || (umkmData.category?.id || '')))
      setSubTitle(umkmData.sub_title || '')
      setDescription(umkmData.description || '')
      setHistory(umkmData.history || '')
      setIsActive(umkmData.is_active ?? true)
      setIsVerified(Boolean(umkmData.last_verified_at))

      setPhone(umkmData.phone || '')
      setWaNumber(umkmData.wa_number || '')
      setAddress(umkmData.address || '')
      setMapTitle(umkmData.map_title || '')
      setMapUrl(umkmData.map_url || '')

      setLegalCertification(umkmData.legal_certification || '')
      setLegalNumber(umkmData.legal_number || '')
      setProductionCapacity(umkmData.production_capacity || '')
      setCapacityNote(umkmData.capacity_note || '')
      setGroupName(umkmData.group_name || '')
      setGroupLocation(umkmData.group_location || '')

      setBannerFile(null)
      setBannerPreview(umkmData.banner_image_url || '')
      setGalleryFiles([])
      setGalleryPreviews([])
      setExistingGalleryUrls(umkmData.gallery_urls || [])

      if (umkmData.products && umkmData.products.length > 0) {
        setProducts(
          umkmData.products.map((p) => ({
            product_id: p.product_id,
            name: p.name || '',
            price: p.price || '',
            description: p.description || '',
            is_active: p.is_active ?? true,
          }))
        )
      } else {
        setProducts([{ name: '', price: '', description: '', is_active: true }])
      }
    } else {
      // Reset form
      setName('')
      setOwnerName('')
      setCategoryId(categories[0]?.category_id ? String(categories[0].category_id) : '')
      setSubTitle('')
      setDescription('')
      setHistory('')
      setIsActive(true)
      setIsVerified(false)

      setPhone('')
      setWaNumber('')
      setAddress('Margodadi, Kec. Ambarawa, Kabupaten Pringsewu, Lampung 35376')
      setMapTitle('')
      setMapUrl('')

      setLegalCertification('NIB / Surat Keterangan Usaha (SKU)')
      setLegalNumber('')
      setProductionCapacity('')
      setCapacityNote('')
      setGroupName('')
      setGroupLocation('Pekon Margodadi')

      setBannerFile(null)
      setBannerPreview('')
      setGalleryFiles([])
      setGalleryPreviews([])
      setExistingGalleryUrls([])

      setProducts([{ name: '', price: '', description: '', is_active: true }])
    }
    setErrors({})
    setActiveTab('profile')
  }, [umkmData, isOpen, categories])

  if (!isOpen) return null

  // Handle Banner file change with automatic client compression
  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, banner: 'Hanya format PNG, JPG, dan JPEG yang diperbolehkan.' }))
        return
      }
      setErrors((prev) => {
        const { banner, ...rest } = prev
        return rest
      })
      setIsProcessingBanner(true)
      try {
        const processedFile = await compressImageFile(file)
        setBannerFile(processedFile)
        setBannerPreview(URL.createObjectURL(processedFile))
      } finally {
        setIsProcessingBanner(false)
      }
    }
  }

  // Handle Gallery files change with automatic client compression
  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files || [])
    const validFiles = []
    const newPreviews = []

    setIsProcessingGallery(true)
    try {
      for (const file of files) {
        if (['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
          const processed = await compressImageFile(file)
          validFiles.push(processed)
          newPreviews.push(URL.createObjectURL(processed))
        }
      }

      setGalleryFiles((prev) => [...prev, ...validFiles])
      setGalleryPreviews((prev) => [...prev, ...newPreviews])
    } finally {
      setIsProcessingGallery(false)
    }
  }

  const removeGalleryPreview = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingGalleryUrl = (index) => {
    setExistingGalleryUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Product Repeater helpers
  const handleProductChange = (index, field, value) => {
    setProducts((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addProductRow = () => {
    setProducts((prev) => [...prev, { name: '', price: '', description: '', is_active: true }])
  }

  const removeProductRow = (index) => {
    if (products.length <= 1) {
      setProducts([{ name: '', price: '', description: '', is_active: true }])
      return
    }
    setProducts((prev) => prev.filter((_, i) => i !== index))
  }

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Nama UMKM wajib diisi.'
    if (!ownerName.trim()) newErrors.ownerName = 'Nama pemilik usaha wajib diisi.'
    if (!categoryId) newErrors.categoryId = 'Kategori usaha wajib dipilih.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setActiveTab('profile') // All mandatory fields are now on Profile tab!
      return
    }

    // Build FormData for multipart file upload
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('owner_name', ownerName.trim())
    formData.append('category_id', categoryId)
    formData.append('sub_title', subTitle.trim())
    formData.append('phone', phone.trim())
    formData.append('wa_number', waNumber.trim() || phone.replace(/[^0-9]/g, ''))
    formData.append('address', address.trim())
    formData.append('description', description.trim())
    formData.append('history', history.trim())
    formData.append('legal_certification', legalCertification.trim())
    formData.append('legal_number', legalNumber.trim())
    formData.append('production_capacity', productionCapacity.trim())
    formData.append('capacity_note', capacityNote.trim())
    formData.append('group_name', groupName.trim())
    formData.append('group_location', groupLocation.trim())
    formData.append('map_title', mapTitle.trim())
    formData.append('map_url', mapUrl.trim())
    formData.append('is_active', isActive ? '1' : '0')
    formData.append('is_verified', isVerified ? '1' : '0')

    // Banner file (PNG, JPG, JPEG) or removal flag
    if (bannerFile) {
      formData.append('banner_image', bannerFile)
      formData.append('remove_banner', '0')
    } else if (!bannerPreview) {
      formData.append('remove_banner', '1')
    } else {
      formData.append('remove_banner', '0')
    }

    // Retained gallery URLs when updating (send array even if empty so backend knows all were removed)
    formData.append('retained_gallery_urls', JSON.stringify(existingGalleryUrls))

    // Gallery files
    if (galleryFiles.length > 0) {
      galleryFiles.forEach((file) => {
        formData.append('gallery_images[]', file)
      })
    }

    // Products payload
    const validProducts = products.filter((p) => p.name.trim() !== '')
    formData.append('products', JSON.stringify(validProducts))

    onSubmit(formData)
  }

  const tabs = [
    { id: 'profile', label: '1. Profil Usaha', icon: 'storefront', hasError: Boolean(errors.name || errors.ownerName || errors.categoryId) },
    { id: 'contact', label: '2. Kontak & Lokasi', icon: 'location_on', hasError: false },
    { id: 'legal', label: '3. Legalitas & Kapasitas', icon: 'verified', hasError: false },
    { id: 'media', label: '4. Upload Foto', icon: 'add_photo_alternate', hasError: Boolean(errors.banner) },
    { id: 'products', label: '5. Produk Unggulan', icon: 'inventory_2', hasError: false },
  ]

  const tabOrder = ['profile', 'contact', 'legal', 'media', 'products']
  const currentTabIndex = tabOrder.indexOf(activeTab)

  const goToNextTab = () => {
    if (currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1])
    }
  }

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1])
    }
  }

  const handleNextClick = () => {
    // Validate Tab 1 profile before moving forward
    if (activeTab === 'profile') {
      const profileErrors = {}
      if (!name.trim()) profileErrors.name = 'Nama UMKM wajib diisi.'
      if (!ownerName.trim()) profileErrors.ownerName = 'Nama pemilik usaha wajib diisi.'
      if (!categoryId) profileErrors.categoryId = 'Kategori usaha wajib dipilih.'

      if (Object.keys(profileErrors).length > 0) {
        setErrors(profileErrors)
        return
      }
    }
    setErrors({})
    goToNextTab()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-4xl h-[92vh] sm:h-[88vh] max-h-[820px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">
                {umkmData ? 'edit_note' : 'add_business'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {umkmData ? `Sunting Data UMKM: ${umkmData.name}` : 'Registrasi Profil UMKM Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Data akan otomatis disinkronkan ke Katalog Publik dan AI Virtual Guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-200/80 bg-white overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.hasError && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Validation Error Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 shrink-0">
            <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
            <div className="flex-1">
              <strong>Mohon lengkapi data wajib berikut:</strong>{' '}
              {Object.values(errors).join(' • ')}
            </div>
          </div>
        )}

        {/* Form Container (flex flex-col flex-1 min-h-0) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: PROFIL USAHA */}
            {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Nama UMKM */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Usaha / UMKM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }))
                    }}
                    placeholder="Contoh: Bengkel Martian"
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.name}</p>}
                </div>

                {/* Nama Pemilik Usaha */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Pemilik / Pengelola Usaha <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value)
                      if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: null }))
                    }}
                    placeholder="Contoh: Bapak Martian / Supardi"
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.ownerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.ownerName && (
                    <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.ownerName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Kategori Bidang Usaha */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori Bidang Usaha <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value)
                      if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: null }))
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${
                      errors.categoryId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Pilih Kategori Usaha...</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={String(cat.category_id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.categoryId}</p>
                  )}
                </div>

                {/* WhatsApp Narahubung */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp Narahubung (Format: 628...)
                  </label>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="Contoh: 6281278901234"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Slogan / Sub-judul */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Slogan / Sub-judul Usaha
                </label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="Contoh: Jasa Perbaikan Kendaraan Bermotor Bergaransi"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Deskripsi Usaha */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi &amp; Profil Lengkap Usaha
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan jenis produk, keunikan, proses pembuatan, atau keunggulan komparatif UMKM ini..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              {/* Kisah / Sejarah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kisah &amp; Sejarah Rintisan Usaha
                </label>
                <textarea
                  rows={3}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="Ceritakan latar belakang awal berdiri, perjuangan perintis, serta peran bagi ekonomi keluarga/dusun..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              {/* Checkboxes Status */}
              <div className="flex flex-wrap items-center gap-6 pt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Publikasikan di Katalog Web Publik
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Tandai Terverifikasi Resmi oleh Balai Pekon
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: KONTAK & LOKASI */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Telepon Alternatif / Rumah
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812-7890-1234"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Label Penanda Titik Google Maps
                  </label>
                  <input
                    type="text"
                    value={mapTitle}
                    onChange={(e) => setMapTitle(e.target.value)}
                    placeholder="Contoh: Bengkel Martian Dusun 02"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Lengkap Tempat Usaha / Bengkel / Gerai
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Dusun 02 RT 04, Pekon Margodadi, Kecamatan Ambarawa"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tautan Google Maps (Pinpoint / Share link)
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LEGALITAS & KAPASITAS */}
          {activeTab === 'legal' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sertifikasi / Perizinan Usaha
                  </label>
                  <input
                    type="text"
                    value={legalCertification}
                    onChange={(e) => setLegalCertification(e.target.value)}
                    placeholder="Contoh: SKU Pekon / NIB / Sertifikat Keahlian"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Izin / Registrasi Legalitas
                  </label>
                  <input
                    type="text"
                    value={legalNumber}
                    onChange={(e) => setLegalNumber(e.target.value)}
                    placeholder="Contoh: No. 503/SKU-MGD/2026"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kapasitas Layanan / Produksi per Bulan
                  </label>
                  <input
                    type="text"
                    value={productionCapacity}
                    onChange={(e) => setProductionCapacity(e.target.value)}
                    placeholder="Contoh: 50 unit kendaraan/bln"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catatan Kapasitas
                  </label>
                  <input
                    type="text"
                    value={capacityNote}
                    onChange={(e) => setCapacityNote(e.target.value)}
                    placeholder="Contoh: Siap panggil ke rumah warga / Bengkel buka tiap hari"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Kelompok Paguyuban / Binaan
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Contoh: Paguyuban Mekanik Muda Pekon"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dusun / Lokasi Sentra Kelompok
                  </label>
                  <input
                    type="text"
                    value={groupLocation}
                    onChange={(e) => setGroupLocation(e.target.value)}
                    placeholder="Contoh: Dusun 02, Margodadi"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD FOTO FISIK (PNG, JPG, JPEG) */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Banner Upload */}
              <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Foto Banner / Sampul Utama UMKM
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Format file fisik yang didukung: <strong>PNG, JPG, JPEG</strong> (Maks. 5MB)
                    </p>
                  </div>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null)
                        setBannerPreview('')
                      }}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  {bannerPreview ? (
                    <div className="relative w-44 h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 shrink-0 shadow-xs">
                      <img
                        src={bannerPreview}
                        alt="Preview Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-28 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                      <span className="material-symbols-outlined text-3xl">image</span>
                      <span className="text-[10px] mt-1">Belum ada foto</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleBannerChange}
                      disabled={isProcessingBanner}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer disabled:opacity-50"
                    />
                    {isProcessingBanner && (
                      <p className="text-xs text-primary flex items-center gap-1.5 font-medium animate-pulse">
                        <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span>Mengompresi &amp; mengoptimalkan foto banner...</span>
                      </p>
                    )}
                    {errors.banner && <p className="text-xs text-rose-500 font-semibold">{errors.banner}</p>}
                    <p className="text-[11px] text-slate-400">
                      Disarankan menggunakan foto horizontal. Sistem otomatis mengompresi gambar resolusi tinggi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Upload */}
              <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Foto Galeri Produk &amp; Aktivitas Produksi
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah beberapa foto dokumentasi (format <strong>PNG, JPG, JPEG</strong>, otomatis dikompresi)
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg"
                  onChange={handleGalleryChange}
                  disabled={isProcessingGallery}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer disabled:opacity-50"
                />

                {isProcessingGallery && (
                  <p className="text-xs text-primary flex items-center gap-1.5 font-medium animate-pulse">
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Mengoptimalkan foto galeri...</span>
                  </p>
                )}

                {/* Gallery Previews Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {existingGalleryUrls.map((url, idx) => (
                    <div
                      key={`exist-${idx}`}
                      className="relative h-24 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 group"
                    >
                      <img src={url} alt={`Galeri ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryUrl(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer transition-opacity"
                        title="Hapus foto"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}

                  {galleryPreviews.map((preview, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative h-24 rounded-xl overflow-hidden border-2 border-primary/50 bg-slate-200 group"
                    >
                      <img src={preview} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryPreview(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer transition-opacity"
                        title="Hapus foto"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary text-[9px] font-bold text-white">
                        Baru
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUK UNGGULAN REPEATER */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Varian &amp; Produk Unggulan
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Produk ini akan ditampilkan di kartu profil dan langsung dikenali oleh Virtual Guide AI
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProductRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Tambah Produk</span>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {products.map((prod, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Produk #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
                        title="Hapus baris produk"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          value={prod.name}
                          onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                          placeholder="Nama Produk / Layanan"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <input
                          type="text"
                          value={prod.price}
                          onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                          placeholder="Harga (misal: 50000)"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={prod.description}
                          onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                          placeholder="Keterangan singkat"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Pinned Fixed Actions Footer */}
          <div className="shrink-0 px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between gap-3">
            {/* Left: Kembali button + Step indicator */}
            <div className="flex items-center gap-2">
              {currentTabIndex > 0 && (
                <button
                  type="button"
                  onClick={goToPrevTab}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Kembali</span>
                </button>
              )}
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Langkah {currentTabIndex + 1} dari {tabOrder.length}:{' '}
                <strong className="text-slate-700">
                  {tabs[currentTabIndex]?.label.replace(/^[0-9]+\.\s*/, '')}
                </strong>
              </span>
            </div>

            {/* Right: Batal & (Lanjut or Simpan) */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Batal
              </button>

              {currentTabIndex < tabOrder.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  <span>Lanjut ke Tab Berikutnya</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan &amp; Sinkron AI...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>{umkmData ? 'Perbarui Data UMKM' : 'Simpan & Indeks ke AI'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
