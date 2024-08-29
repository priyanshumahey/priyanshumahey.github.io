"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ProjectProp = {
  name: string;
  description: string;
  image: string;
  badgeName?: string;
  badgeUrl?: string;
  children?: React.ReactNode;
};

export const ProjectCard = ({
  name,
  description,
  image,
  badgeName,
  badgeUrl,
  children,
}: ProjectProp) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const DialogDrawerContent = () => (
    <>
      <div className="mt-2 relative aspect-[16/10] overflow-hidden rounded-xl">
        <Image
          className="object-cover"
          fill
          layout="fill"
          src={image}
          alt={`${name} project cover image`}
        />
      </div>
      <h2 className="text-2xl font-bold mt-4">{name}</h2>
      <p className="mt-2">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative rounded-xl px-5 py-6 shadow-lg border-2 border-[#dadada] bg-opacity-25 bg-white cursor-pointer">
            <div className="flex flex-row flex-wrap items-start justify-between">
              <h4 className="text-xl font-semibold">{name}</h4>
              {badgeName && (
                <div>
                  {badgeUrl ? (
                    <Link href={badgeUrl}>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200"
                      >
                        {badgeName}
                      </Badge>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {badgeName}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <p className="text-black">{description}</p>
            <div className="mt-2 relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image
                className="object-cover"
                fill
                layout="fill"
                src={image}
                alt={`${name} project cover image`}
              />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogDrawerContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="relative rounded-xl px-5 py-6 shadow-lg border-2 border-[#dadada] bg-opacity-25 bg-white cursor-pointer">
          <div className="flex flex-row flex-wrap items-start justify-between">
            <h4 className="text-xl font-semibold">{name}</h4>
            {badgeName && (
              <div>
                {badgeUrl ? (
                  <Link href={badgeUrl}>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200"
                    >
                      {badgeName}
                    </Badge>
                  </Link>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {badgeName}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <p className="text-black">{description}</p>
          <div className="mt-2 relative aspect-[16/10] overflow-hidden rounded-xl">
            <Image
              className="object-cover"
              fill
              layout="fill"
              src={image}
              alt={`${name} project cover image`}
            />
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{name}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <DialogDrawerContent />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};