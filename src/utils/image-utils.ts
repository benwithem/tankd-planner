/**
 * Utilities for handling image paths and validations
 */

// Default image paths for different entity types
const DEFAULT_IMAGES = {
  fish: {
    image: '/images/fish-placeholder.jpg',
    thumbnail: '/thumbnails/fish-placeholder-thumb.jpg',
  },
  tank: {
    image: '/images/tank-placeholder.jpg',
    thumbnail: '/thumbnails/tank-placeholder-thumb.jpg',
  },
  plant: {
    image: '/images/plant-placeholder.jpg',
    thumbnail: '/thumbnails/plant-placeholder-thumb.jpg',
  },
  equipment: {
    image: '/images/equipment-placeholder.jpg',
    thumbnail: '/thumbnails/equipment-placeholder-thumb.jpg',
  },
};

type EntityType = keyof typeof DEFAULT_IMAGES;
type ImageType = 'image' | 'thumbnail';

/**
 * Validates and returns an appropriate image path
 * If provided path is undefined, empty, or invalid, returns a default fallback
 * @param path The image path to validate
 * @param entityType The type of entity (fish, tank, etc.)
 * @param imageType Whether it's a full image or thumbnail
 * @returns A valid image path
 */
export function getValidImagePath(
  path: string | undefined,
  entityType: EntityType,
  imageType: ImageType = 'image'
): string {
  // Check if path is defined and not empty
  if (!path || path.trim() === '') {
    return DEFAULT_IMAGES[entityType][imageType];
  }

  // Check if path is relative or absolute
  if (!path.startsWith('/') && !path.startsWith('http')) {
    // Convert to absolute path
    return `/${path.replace(/^\.?\/?/, '')}`;
  }

  return path;
}

/**
 * Gets both image and thumbnail paths with validation
 * @param entity The entity with image properties
 * @param entityType The type of entity
 * @returns Object with validated image and thumbnail paths
 */
export function getEntityImages(
  entity: { image?: string; thumbnail?: string },
  entityType: EntityType
): { image: string; thumbnail: string } {
  return {
    image: getValidImagePath(entity.image, entityType, 'image'),
    thumbnail: getValidImagePath(entity.thumbnail, entityType, 'thumbnail'),
  };
}
