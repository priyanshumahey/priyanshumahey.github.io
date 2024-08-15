import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";

type ProjectProp = {
  name: string;
  description: string;
  image: string;
  badgeName?: string;
  badgeUrl?: string;
};

export const ProjectCard = ({
  name,
  description,
  image,
  badgeName,
  badgeUrl,
}: ProjectProp) => {
  return (
    <div className="relative rounded-xl px-5 py-6 shadow-lg border-2 border-[#dadada] bg-opacity-25 bg-white">
      <div className="flex flex-row flex-wrap items-start justify-between">
        <h4 className="text-xl font-semibold tracking-tight">{name}</h4>
        {badgeName && (
          <div>
            {badgeUrl && (
              <Link href={badgeUrl}>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200"
                >
                  {badgeName}
                </Badge>
              </Link>
            )}
            {!badgeUrl && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                {badgeName}
              </Badge>
            )}
          </div>
        )}
      </div>
      <p className="text-lg tracking-tight">{description}</p>
      <div className="mt-2 relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl">
        <Image
          className="object-cover"
          fill
          layout="fill"
          src={image}
          alt={`${name} project cover image`}
        />
      </div>
    </div>
  );
};
