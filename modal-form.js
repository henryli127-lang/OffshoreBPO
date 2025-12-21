// Consultation Modal JavaScript - Reusable for all pages
(function() {
	// Wait for DOM to be ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initModal);
	} else {
		initModal();
	}

	function initModal() {
		const consultationModal = document.getElementById('consultation-modal');
		if (!consultationModal) return;

		const consultationForm = document.getElementById('consultation-form');
		const consultationSuccess = document.getElementById('consultation-success');
		const modalTitle = document.getElementById('modal-title');
		const modalClose = document.querySelector('.modal-close');
		const modalCancel = document.querySelector('.modal-cancel');
		const consultationBtns = document.querySelectorAll('#consultation-btn-hero, #consultation-btn-cta');
		const contactBtns = document.querySelectorAll('#contact-btn-nav, #contact-btn-cta');

		// Open modal function
		const openModal = (title, submitText = 'Book Consultation') => {
			if (modalTitle) modalTitle.textContent = title;
			const submitBtn = document.getElementById('form-submit-btn');
			if (submitBtn) {
				submitBtn.textContent = submitText;
			}
			consultationModal.classList.add('active');
			document.body.style.overflow = 'hidden';
		};

		// Open modal for consultation buttons
		consultationBtns.forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				openModal('Book a Free Consultation', 'Book Consultation');
			});
		});

		// Open modal for contact buttons
		contactBtns.forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				openModal('Contact Us', 'Send Message');
			});
		});

		// Close modal
		const closeModal = () => {
			consultationModal.classList.remove('active');
			document.body.style.overflow = '';
			if (consultationForm) consultationForm.style.display = 'block';
			if (consultationSuccess) consultationSuccess.style.display = 'none';
			if (consultationForm) consultationForm.reset();
		};

		if (modalClose) {
			modalClose.addEventListener('click', closeModal);
		}

		if (modalCancel) {
			modalCancel.addEventListener('click', closeModal);
		}

		// Close modal when clicking outside
		consultationModal.addEventListener('click', (e) => {
			if (e.target === consultationModal) {
				closeModal();
			}
		});

		// Form submission
		if (consultationForm) {
			consultationForm.addEventListener('submit', async (e) => {
				e.preventDefault();

				const formData = {
					name: document.getElementById('name').value,
					email: document.getElementById('email').value,
					phone: document.getElementById('phone').value,
					country: document.getElementById('country').value,
					employees: document.getElementById('employees').value
				};

				// Show loading state
				const submitBtn = consultationForm.querySelector('button[type="submit"]');
				const originalText = submitBtn.textContent;
				submitBtn.disabled = true;
				submitBtn.textContent = 'Submitting...';

				try {
					const response = await fetch('/api/consultation', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(formData)
					});

					const result = await response.json();

					if (response.ok) {
						consultationForm.style.display = 'none';
						if (consultationSuccess) consultationSuccess.style.display = 'block';
					} else {
						const errorMsg = result.error || `Server error (${response.status}): ${response.statusText}`;
						console.error('Server error:', errorMsg);
						alert(errorMsg);
						submitBtn.disabled = false;
						submitBtn.textContent = originalText;
					}
				} catch (error) {
					console.error('Error:', error);
					alert('Network error: ' + error.message + '. Please check if the server is running.');
					submitBtn.disabled = false;
					submitBtn.textContent = originalText;
				}
			});
		}
	}
})();

