/* 
========================================================================
   SHARDA INDUSTRIAL SECURITY & MANPOWER SERVICES (SISMS)
   Interactive Logic (script.js)
   Author: Senior UI/UX Designer & Software Architect
   Description: Controls interactive elements, form validation, gallery filters, 
                and accessible lightbox functionality. Supports AJAX Web3Forms.
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. STICKY HEADER SCROLL EFFECT
    // ==========================================
    const navbar = document.querySelector('.navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run on load to check initial position
    
    // ==========================================
    // 2. ACTIVE NAVIGATION ITEM TRACKING
    // ==========================================
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        // Remove active class first
        link.classList.remove('active');
        
        // Get the link destination filename
        const linkHref = link.getAttribute('href');
        
        // Check if current path ends with the link destination or if we are at root and link is index.html
        if (currentPath.endsWith(linkHref) || 
            (currentPath === '/' && linkHref === 'index.html') || 
            (currentPath.endsWith('/') && linkHref === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // ==========================================
    // 3. ACCESSIBLE MOBILE MENU CLOSURES
    // ==========================================
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close menu on pressing Escape key when open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
                navbarToggler.focus();
            }
        });
        
        // Close menu when clicking outside the navbar
        document.addEventListener('click', (e) => {
            const isClickInsideNavbar = navbar.contains(e.target);
            if (!isClickInsideNavbar && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });
    }

    // ==========================================
    // 4. CONTACT FORM VALIDATION & AJAX SUBMIT
    // ==========================================
    const contactForm = document.getElementById('sismsContactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const name = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const phone = document.getElementById('contactPhone');
            const message = document.getElementById('contactMessage');
            
            // Basic validation check helper
            const checkField = (field, condition) => {
                if (condition) {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                } else {
                    field.classList.remove('is-valid');
                    field.classList.add('is-invalid');
                    isValid = false;
                }
            };
            
            // Execute validation rules
            checkField(name, name.value.trim().length >= 3);
            checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
            checkField(phone, /^[6-9]\d{9}$/.test(phone.value.trim())); // Standard Indian phone pattern
            checkField(message, message.value.trim().length >= 10);
            
            if (isValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                // Check if a real Web3Forms access key is configured
                const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
                const hasRealKey = accessKeyInput && accessKeyInput.value && accessKeyInput.value !== 'YOUR_ACCESS_KEY_HERE';
                
                if (hasRealKey) {
                    // Show loading state
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
                    
                    const formData = new FormData(contactForm);
                    
                    fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showSuccessNotification(
                                'Inquiry Submitted!',
                                `Thank you, ${name.value.trim()}. Our security specialists will contact you within 2 hours.`
                            );
                            contactForm.reset();
                            // Reset validation highlights
                            const validatedFields = contactForm.querySelectorAll('.is-valid');
                            validatedFields.forEach(f => f.classList.remove('is-valid'));
                        } else {
                            showSuccessNotification(
                                'Submission Error',
                                'There was an issue sending your message. Please try again.'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showSuccessNotification(
                            'Network Error',
                            'Please check your internet connection and try again.'
                        );
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    });
                } else {
                    // Local Demo Mode simulation
                    showSuccessNotification(
                        'Inquiry Received (Demo Mode)',
                        `Thank you, ${name.value.trim()}. Your inquiry has been processed. (To receive actual emails, replace 'YOUR_ACCESS_KEY_HERE' in the HTML file with your Web3Forms key).`
                    );
                    contactForm.reset();
                    const validatedFields = contactForm.querySelectorAll('.is-valid');
                    validatedFields.forEach(f => f.classList.remove('is-valid'));
                }
            }
        });
    }

    // ==========================================
    // 5. CAREERS FORM & FILE UPLOAD INTERACTION
    // ==========================================
    const careersForm = document.getElementById('sismsCareersForm');
    const fileInput = document.getElementById('careerResume');
    const uploadWrapper = document.querySelector('.file-upload-wrapper');
    const filenameDisplay = document.querySelector('.file-upload-filename');
    
    // File upload visual feedback
    if (fileInput && uploadWrapper) {
        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length > 0) {
                const name = fileInput.files[0].name;
                filenameDisplay.textContent = `Selected File: ${name}`;
                filenameDisplay.style.display = 'block';
                uploadWrapper.style.borderColor = 'var(--accent-orange)';
            } else {
                filenameDisplay.style.display = 'none';
                uploadWrapper.style.borderColor = '#CBD5E1';
            }
        });
        
        // Drag over effects
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadWrapper.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadWrapper.classList.remove('dragover');
            }, false);
        });
    }
    
    // Careers form submission validation
    if (careersForm) {
        careersForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const name = document.getElementById('careerName');
            const phone = document.getElementById('careerPhone');
            const email = document.getElementById('careerEmail');
            const position = document.getElementById('careerPosition');
            const experience = document.getElementById('careerExperience');
            
            const checkField = (field, condition) => {
                if (condition) {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                } else {
                    field.classList.remove('is-valid');
                    field.classList.add('is-invalid');
                    isValid = false;
                }
            };
            
            checkField(name, name.value.trim().length >= 3);
            checkField(phone, /^[6-9]\d{9}$/.test(phone.value.trim()));
            checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
            checkField(position, position.value !== "");
            checkField(experience, experience.value !== "");
            
            // Validate File Attachment
            if (!fileInput.files || fileInput.files.length === 0) {
                uploadWrapper.style.borderColor = 'red';
                isValid = false;
            } else {
                uploadWrapper.style.borderColor = '#CBD5E1';
            }
            
            if (isValid) {
                const submitBtn = careersForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                // Check if a real Web3Forms access key is configured
                const accessKeyInput = careersForm.querySelector('input[name="access_key"]');
                const hasRealKey = accessKeyInput && accessKeyInput.value && accessKeyInput.value !== 'YOUR_ACCESS_KEY_HERE';
                
                if (hasRealKey) {
                    // Show loading state
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading Application...';
                    
                    const formData = new FormData(careersForm);
                    
                    fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showSuccessNotification(
                                'Application Received!',
                                `Thank you, ${name.value.trim()}. Your application for the ${position.options[position.selectedIndex].text} role has been securely uploaded.`
                            );
                            careersForm.reset();
                            if (filenameDisplay) filenameDisplay.style.display = 'none';
                            const validatedFields = careersForm.querySelectorAll('.is-valid');
                            validatedFields.forEach(f => f.classList.remove('is-valid'));
                        } else {
                            showSuccessNotification(
                                'Submission Error',
                                'There was an issue uploading your application. Please try again.'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showSuccessNotification(
                            'Network Error',
                            'Please check your internet connection and try again.'
                        );
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    });
                } else {
                    // Local Demo Mode simulation
                    showSuccessNotification(
                        'Application Received (Demo Mode)',
                        `Thank you, ${name.value.trim()}. Your application for the ${position.options[position.selectedIndex].text} role has been processed. (To receive actual emails, replace 'YOUR_ACCESS_KEY_HERE' in the HTML file with your Web3Forms key).`
                    );
                    careersForm.reset();
                    if (filenameDisplay) filenameDisplay.style.display = 'none';
                    const validatedFields = careersForm.querySelectorAll('.is-valid');
                    validatedFields.forEach(f => f.classList.remove('is-valid'));
                }
            }
        });
    }

    // ==========================================
    // 6. GALLERY CATEGORY FILTER (Vanilla JS)
    // ==========================================
    const filterButtons = document.querySelectorAll('.btn-filter');
    const galleryItems = document.querySelectorAll('.gallery-col'); // Select the wrapping column elements
    
    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Set active filter button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                galleryItems.forEach(col => {
                    const item = col.querySelector('.gallery-item');
                    const category = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        col.style.display = 'block';
                        // Trigger simple visual fade-in
                        col.style.opacity = '0';
                        setTimeout(() => {
                            col.style.opacity = '1';
                            col.style.transition = 'opacity 0.4s ease';
                        }, 50);
                    } else {
                        col.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==========================================
    // 7. ACCESSIBLE VANILLA LIGHTBOX MODAL
    // ==========================================
    const galleryTriggers = document.querySelectorAll('.gallery-overlay');
    
    if (galleryTriggers.length > 0) {
        // Create Lightbox DOM elements if not already there
        let lightbox = document.getElementById('sismsLightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'sismsLightbox';
            lightbox.className = 'sisms-lightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Image Lightbox');
            
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
                    <button class="lightbox-nav lightbox-prev" aria-label="Previous Image"><i class="fas fa-chevron-left"></i></button>
                    <img class="lightbox-img" src="" alt="Lightbox Preview">
                    <button class="lightbox-nav lightbox-next" aria-label="Next Image"><i class="fas fa-chevron-right"></i></button>
                    <div class="lightbox-caption"></div>
                </div>
            `;
            document.body.appendChild(lightbox);
        }
        
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        let activeImages = [];
        let currentIndex = 0;
        
        // Open Lightbox
        const openLightbox = (index, imagesArray) => {
            activeImages = imagesArray;
            currentIndex = index;
            updateLightboxContent();
            
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden'; // Stop page scrolling
            closeBtn.focus();
        };
        
        // Close Lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('show');
            document.body.style.overflow = 'auto'; // Enable page scrolling
        };
        
        // Update Lightbox Visual Content
        const updateLightboxContent = () => {
            const currentImgElement = activeImages[currentIndex].querySelector('img');
            const currentCaptionElement = activeImages[currentIndex].querySelector('.gallery-info h4');
            
            if (currentImgElement) {
                lightboxImg.src = currentImgElement.src;
                lightboxImg.alt = currentImgElement.alt || 'SISMS Gallery Preview';
            }
            if (currentCaptionElement) {
                lightboxCaption.textContent = currentCaptionElement.textContent;
            }
        };
        
        // Navigation Logic
        const showNextImage = () => {
            currentIndex = (currentIndex + 1) % activeImages.length;
            updateLightboxContent();
        };
        
        const showPrevImage = () => {
            currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
            updateLightboxContent();
        };
        
        // Bind Click Triggers
        galleryTriggers.forEach((trigger) => {
            trigger.addEventListener('click', (e) => {
                const item = trigger.closest('.gallery-item');
                // Get list of currently visible gallery-item elements (respecting filters)
                const visibleCols = Array.from(document.querySelectorAll('.gallery-col'))
                    .filter(col => col.style.display !== 'none');
                
                const visibleItems = visibleCols.map(col => col.querySelector('.gallery-item'));
                const itemIndex = visibleItems.indexOf(item);
                
                openLightbox(itemIndex, visibleItems);
            });
        });
        
        // Bind Lightbox Actions
        closeBtn.addEventListener('click', closeLightbox);
        nextBtn.addEventListener('click', showNextImage);
        prevBtn.addEventListener('click', showPrevImage);
        
        // Close on clicking overlay background
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
        
        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('show')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
        });
    }

    // ==========================================
    // 8. HELPER: SUCCESS NOTIFICATION GENERATOR
    // ==========================================
    const showSuccessNotification = (title, message) => {
        // Check if an alert already exists
        const existingAlert = document.getElementById('sismsSuccessAlert');
        if (existingAlert) existingAlert.remove();
        
        const alertBox = document.createElement('div');
        alertBox.id = 'sismsSuccessAlert';
        alertBox.className = 'fade show';
        
        // Custom elegant notification container styled directly to overlay cleanly
        Object.assign(alertBox.style, {
            position: 'fixed',
            top: '30px',
            right: '30px',
            backgroundColor: '#0c2340',
            color: '#ffffff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: '9999',
            maxWidth: '400px',
            borderLeft: '5px solid #F47C20',
            animation: 'fadeInUp 0.4s ease'
        });
        
        alertBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <h4 style="margin:0; color:#F47C20; font-family:'Poppins',sans-serif; font-weight:700; font-size:1.15rem;">
                    <i class="fas fa-check-circle" style="margin-right:8px;"></i>${title}
                </h4>
                <button id="closeAlertBtn" aria-label="Close Notification" style="background:none; border:none; color:#ffffff; font-size:1.2rem; cursor:pointer; padding:0; line-height:1;">&times;</button>
            </div>
            <p style="margin:0; font-size:0.92rem; color:rgba(255,255,255,0.9); line-height:1.6;">${message}</p>
        `;
        
        document.body.appendChild(alertBox);
        
        // Auto-close notification after 8 seconds
        const autoCloseTimeout = setTimeout(() => {
            alertBox.remove();
        }, 8000);
        
        // Manual close trigger
        const closeBtn = alertBox.querySelector('#closeAlertBtn');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoCloseTimeout);
            alertBox.remove();
        });
    };
});
