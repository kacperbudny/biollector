import { StarIcon } from "@heroicons/react/24/solid";
import { Card, Chip } from "@heroui/react";
import Image from "next/image";
import { NotInterestedButton } from "@/components/sets/not-interested-button";
import { SetRatingInput } from "@/components/sets/set-rating-input";
import { ToggleCollectionButton } from "@/components/sets/toggle-collection-button";
import { WishlistButton } from "@/components/sets/wishlist-button";
import type { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import { cn } from "@/styles/cn";

type SetCardProps = {
  set: SetViewModel;
  wave: Wave;
};

export function SetCard({ set, wave }: SetCardProps) {
  return (
    <Card className="gap-0 overflow-hidden border border-border p-0 transition-transform hover:scale-105">
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
          <WishlistButton
            setNumber={set.catalogNumber}
            wishlisted={set.wishlisted}
          />
          <NotInterestedButton
            setNumber={set.catalogNumber}
            notInterested={set.notInterested}
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
        "border-0",
      )}
      role="img"
      aria-label={
        averageRating ? `Average rating ${averageRating}` : "No ratings yet"
      }
    >
      <StarIcon className="h-3.5 w-3.5 text-warning" />
      {averageRating ? averageRating.toFixed(1) : "–"}
    </Chip>
  );
}
