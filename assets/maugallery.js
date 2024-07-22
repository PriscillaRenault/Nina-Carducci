(function ($) {
	// Définition du plugin mauGallery
	$.fn.mauGallery = function (options) {
		// Fusionner les options par défaut avec celles fournies par l'utilisateur
		var options = $.extend($.fn.mauGallery.defaults, options);
		var tagsCollection = []; // Collection pour stocker les tags uniques
		return this.each(function () {
			// Créer un wrapper de ligne pour les éléments de la galerie
			$.fn.mauGallery.methods.createRowWrapper($(this));
			if (options.lightBox) {
				// Créer la lightbox si l'option est activée
				$.fn.mauGallery.methods.createLightBox(
					$(this),
					options.lightboxId,
					options.navigation
				);
			}
			// Attacher les écouteurs d'événements
			$.fn.mauGallery.listeners(options);

			// Parcourir chaque élément .gallery-item
			$(this)
				.children(".gallery-item")
				.each(function (index) {
					// Rendre l'élément image responsive
					$.fn.mauGallery.methods.responsiveImageItem($(this));
					// Déplacer l'élément dans le wrapper de ligne
					$.fn.mauGallery.methods.moveItemInRowWrapper($(this));
					// Emballer l'élément dans une colonne
					$.fn.mauGallery.methods.wrapItemInColumn(
						$(this),
						options.columns
					);
					var theTag = $(this).data("gallery-tag");
					// Ajouter le tag à la collection s'il est unique
					if (
						options.showTags &&
						theTag !== undefined &&
						tagsCollection.indexOf(theTag) === -1
					) {
						tagsCollection.push(theTag);
					}
				});

			// Afficher les tags si l'option est activée
			if (options.showTags) {
				$.fn.mauGallery.methods.showItemTags(
					$(this),
					options.tagsPosition,
					tagsCollection
				);
			}

			// Afficher la galerie avec un effet de fondu
			$(this).fadeIn(500);
		});
	};

	// Options par défaut du plugin
	$.fn.mauGallery.defaults = {
		columns: 3,
		lightBox: true,
		lightboxId: null,
		showTags: true,
		tagsPosition: "bottom",
		navigation: true,
	};

	// Fonction pour attacher les écouteurs d'événements
	$.fn.mauGallery.listeners = function (options) {
		// Lorsque l'on clique sur un élément de la galerie
		$(".gallery-item").on("click", function () {
			if (options.lightBox && $(this).prop("tagName") === "IMG") {
				// Ouvrir la lightbox si activée
				$.fn.mauGallery.methods.openLightBox(
					$(this),
					options.lightboxId
				);
			} else {
				return;
			}
		});

		// Écouteur pour le filtrage par tags
		$(".gallery").on(
			"click",
			".nav-link",
			$.fn.mauGallery.methods.filterByTag
		);
		// Écouteurs pour la navigation dans la lightbox
		$(".gallery").on("click", ".mg-prev", () =>
			$.fn.mauGallery.methods.prevImage(options.lightboxId)
		);
		$(".gallery").on("click", ".mg-next", () =>
			$.fn.mauGallery.methods.nextImage(options.lightboxId)
		);
	};

	// Définition des méthodes du plugin
	$.fn.mauGallery.methods = {
		// Créer un wrapper de ligne pour les éléments de la galerie
		createRowWrapper(element) {
			if (!element.children().first().hasClass("row")) {
				element.append('<div class="gallery-items-row row"></div>');
			}
		},
		// Emballer un élément dans une colonne
		wrapItemInColumn(element, columns) {
			if (columns.constructor === Number) {
				element.wrap(
					`<div class='item-column mb-4 col-${Math.ceil(
						12 / columns
					)}'></div>`
				);
			} else if (columns.constructor === Object) {
				var columnClasses = "";
				if (columns.xs) {
					columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
				}
				if (columns.sm) {
					columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
				}
				if (columns.md) {
					columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
				}
				if (columns.lg) {
					columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
				}
				if (columns.xl) {
					columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
				}
				element.wrap(
					`<div class='item-column mb-4${columnClasses}'></div>`
				);
			} else {
				console.error(
					`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
				);
			}
		},
		// Déplacer un élément dans le wrapper de ligne
		moveItemInRowWrapper(element) {
			element.appendTo(".gallery-items-row");
		},
		// Rendre l'élément image responsive
		responsiveImageItem(element) {
			if (element.prop("tagName") === "IMG") {
				element.addClass("img-fluid");
			}
		},
		// Ouvrir la lightbox avec l'image cliquée
		openLightBox(element, lightboxId) {
			$(`#${lightboxId}`)
				.find(".lightboxImage")
				.attr("src", element.attr("src"));
			$(`#${lightboxId}`).modal("toggle");
		},
		// Afficher l'image précédente dans la lightbox
		prevImage() {
			let activeImage = null;
			$("img.gallery-item").each(function () {
				if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
					activeImage = $(this);
				}
			});
			let activeTag = $(".tags-bar span.active-tag").data(
				"images-toggle"
			);
			let imagesCollection = [];
			if (activeTag === "all") {
				$(".item-column").each(function () {
					if ($(this).children("img").length) {
						imagesCollection.push($(this).children("img"));
					}
				});
			} else {
				$(".item-column").each(function () {
					if (
						$(this).children("img").data("gallery-tag") ===
						activeTag
					) {
						imagesCollection.push($(this).children("img"));
					}
				});
			}
			let index = 0,
				next = null;

			$(imagesCollection).each(function (i) {
				if ($(activeImage).attr("src") === $(this).attr("src")) {
					index = i;
				}
			});
			next =
				imagesCollection[index] ||
				imagesCollection[imagesCollection.length - 1];
			$(".lightboxImage").attr("src", $(next).attr("src"));
		},
		// Afficher l'image suivante dans la lightbox
		nextImage() {
			let activeImage = null;
			$("img.gallery-item").each(function () {
				if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
					activeImage = $(this);
				}
			});
			let activeTag = $(".tags-bar span.active-tag").data(
				"images-toggle"
			);
			let imagesCollection = [];
			if (activeTag === "all") {
				$(".item-column").each(function () {
					if ($(this).children("img").length) {
						imagesCollection.push($(this).children("img"));
					}
				});
			} else {
				$(".item-column").each(function () {
					if (
						$(this).children("img").data("gallery-tag") ===
						activeTag
					) {
						imagesCollection.push($(this).children("img"));
					}
				});
			}
			let index = 0,
				next = null;

			$(imagesCollection).each(function (i) {
				if ($(activeImage).attr("src") === $(this).attr("src")) {
					index = i;
				}
			});
			next = imagesCollection[index] || imagesCollection[0];
			$(".lightboxImage").attr("src", $(next).attr("src"));
		},
		// Créer la structure HTML pour la lightbox
		createLightBox(gallery, lightboxId, navigation) {
			gallery.append(`<div class="modal fade" id="${
				lightboxId ? lightboxId : "galleryLightbox"
			}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
								navigation
									? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
									: '<span style="display:none;" />'
							}
                            <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                            ${
								navigation
									? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
									: '<span style="display:none;" />'
							}
                        </div>
                    </div>
                </div>
            </div>`);
		},
		// Afficher les tags de filtre
		showItemTags(gallery, position, tags) {
			var tagItems =
				'<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
			$.each(tags, function (index, value) {
				tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
			});
			var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

			if (position === "bottom") {
				gallery.append(tagsRow);
			} else if (position === "top") {
				gallery.prepend(tagsRow);
			} else {
				console.error(`Unknown tags position: ${position}`);
			}
		},
		// Filtrer les éléments de la galerie par tag
		filterByTag() {
			if ($(this).hasClass("active-tag")) {
				return;
			}
			$(".active-tag").removeClass("active active-tag");
			$(this).addClass("active-tag");

			var tag = $(this).data("images-toggle");

			$(".gallery-item").each(function () {
				$(this).parents(".item-column").hide();
				if (tag === "all") {
					$(this).parents(".item-column").show(300);
				} else if ($(this).data("gallery-tag") === tag) {
					$(this).parents(".item-column").show(300);
				}
			});
		},
	};
})(jQuery);
