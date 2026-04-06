import { StarIcon } from "@heroicons/react/24/solid";
import { Card, Chip } from "@heroui/react";
import Image from "next/image";
import { SetRatingInput } from "@/components/sets/set-rating-input";
import { ToggleCollectionButton } from "@/components/sets/toggle-collection-button";
import { WishlistScalePicker } from "@/components/sets/wishlist-scale-picker";
import type { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import { cn } from "@/styles/cn";

type SetCardProps = {
  set: SetViewModel;
  wave: Wave;
};

export function SetCard({ set, wave }: SetCardProps) {
  return (
    <Card className="gap-0 overflow-hidden border border-border p-0 md:transition-transform [@media(hover:hover)]:md:hover:scale-105">
      <Card.Header className="shrink-0 p-0">
        <div className="relative aspect-square min-h-[120px] w-full bg-default">
          <Image
            src={`/sets/${set.imageName}`}
            alt={set.name}
            fill
            className={cn(
              "object-cover object-center",
              set.notInterested && "grayscale",
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 16vw"
          />
          <WishlistScalePicker
            setNumber={set.catalogNumber}
            wishlistScale={set.wishlistScale}
          />
          <ToggleCollectionButton
            setNumber={set.catalogNumber}
            isInCollection={set.isInCollection}
          />
          <AverageRatingChip averageRating={set.averageRating} />
        </div>
      </Card.Header>
      <Card.Content className="bg-surface px-3 pb-3 pt-2.5">
        <h3 className="text-sm font-semibold">{set.name}</h3>
        <p className="text-xs font-semibold">{set.catalogNumber}</p>
        <p className="text-xs text-muted">
          {set.releaseYear} • {wave}
        </p>
        <SetRatingInput
          setNumber={set.catalogNumber}
          userRating={set.userRating}
        />
      </Card.Content>
    </Card>
  );
}

function AverageRatingChip({ averageRating }: { averageRating?: number }) {
  return (
    <Chip
      size="sm"
      color="warning"
      variant="soft"
      className={cn(
        "absolute right-2 bottom-2 z-10 bg-black/50 text-white backdrop-blur-sm",
        "border-0 px-2.5 py-1.5 text-sm md:px-1.5 md:py-0.5 md:text-xs",
      )}
      role="img"
      aria-label={
        averageRating ? `Average rating ${averageRating}` : "No ratings yet"
      }
    >
      <StarIcon className="h-4 w-4 text-warning md:h-3.5 md:w-3.5" />
      {averageRating ? averageRating.toFixed(1) : "–"}
    </Chip>
  );
}
