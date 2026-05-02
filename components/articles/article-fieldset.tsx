"use client";

import { type UseFormReturn, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "@/components/articles/photo-uploader";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/constants";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CONDITIONS,
} from "@/lib/validations/article";
import type { Enums } from "@/types/database";

type ArticleFieldsetProps = {
  // RHF can't infer through nested path prefixes — accept a loose form ref
  // and rely on the form's own resolver for safety.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  userId: string;
  articleId?: string;
};

export function ArticleFieldset({
  form: f,
  userId,
  articleId,
}: ArticleFieldsetProps) {
  const category = useWatch({
    control: f.control,
    name: "article.category",
  }) as Enums<"article_category"> | undefined;

  return (
    <div className="space-y-5">
      {/* Category & Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="article.category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={f.control}
          name="article.condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>État *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ARTICLE_CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CONDITION_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={f.control}
        name="article.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom *</FormLabel>
            <FormControl>
              <Input placeholder="Air Jordan 4 Bred" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="article.brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marque</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nike, Rolex, Pokémon…"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={f.control}
          name="article.reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Référence</FormLabel>
              <FormControl>
                <Input
                  placeholder="308497-060"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Sneakers-specific */}
      {category === "sneakers" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={f.control}
            name="article.size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taille</FormLabel>
                <FormControl>
                  <Input
                    placeholder="42"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={f.control}
            name="article.colorway"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coloris</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Black/Cement"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      {/* Cards or Watches: serial / certificate */}
      {category === "cards" || category === "watches" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={f.control}
            name="article.serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° de série</FormLabel>
                <FormControl>
                  <Input
                    placeholder="PSA 87234567 / K123456…"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={f.control}
            name="article.certificate_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de certificat</FormLabel>
                <FormControl>
                  <Input
                    placeholder="—"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      {/* Boolean toggles per category */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(category === "cards" || category === "watches") && (
          <FormField
            control={f.control}
            name="article.has_certificate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  Avec certificat
                </FormLabel>
              </FormItem>
            )}
          />
        )}
        {category !== "cards" && (
          <FormField
            control={f.control}
            name="article.has_original_box"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  Boîte d&apos;origine
                </FormLabel>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={f.control}
          name="article.has_accessories"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                Accessoires
              </FormLabel>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={f.control}
        name="article.accessories_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Détail des accessoires</FormLabel>
            <FormControl>
              <Input
                placeholder="Boîte + papiers + factures…"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags */}
      <FormField
        control={f.control}
        name="article.tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input
                placeholder="jordan, bred, grail"
                value={
                  Array.isArray(field.value) ? field.value.join(", ") : ""
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
              />
            </FormControl>
            <FormDescription>
              Séparés par des virgules.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={f.control}
        name="article.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Détails de l&apos;achat, défauts, contexte…"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Photos */}
      <FormField
        control={f.control}
        name="article.photos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Photos</FormLabel>
            <FormControl>
              <PhotoUploader
                value={field.value ?? []}
                onChange={field.onChange}
                userId={userId}
                articleId={articleId}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
