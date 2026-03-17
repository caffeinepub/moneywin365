import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Coins, Plus, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";

interface AdminPanelProps {
  actor: backendInterface | null;
}

export default function AdminPanel({ actor }: AdminPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");

  const promotionsQuery = useQuery({
    queryKey: ["admin_promotions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPromotions();
    },
    enabled: !!actor,
  });

  const createPromoMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.createPromotion(
        title,
        description,
        BigInt(Number.parseInt(bonusAmount)),
      );
    },
    onSuccess: () => {
      toast.success("Promotion created!");
      setTitle("");
      setDescription("");
      setBonusAmount("");
      promotionsQuery.refetch();
    },
    onError: () => toast.error("Failed to create promotion"),
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage promotions and platform settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="casino-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Create Promotion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-title">Title</Label>
              <Input
                id="promo-title"
                data-ocid="admin.promo_title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekend Bonus..."
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-desc">Description</Label>
              <Textarea
                id="promo-desc"
                data-ocid="admin.promo_desc_input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the promotion..."
                className="bg-input border-border"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-bonus">Bonus Credits</Label>
              <Input
                id="promo-bonus"
                type="number"
                data-ocid="admin.promo_bonus_input"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                placeholder="500"
                className="bg-input border-border"
                min="1"
              />
            </div>
            <Button
              data-ocid="admin.submit_promo_button"
              onClick={() => createPromoMutation.mutate()}
              disabled={
                createPromoMutation.isPending ||
                !title ||
                !description ||
                !bonusAmount
              }
              className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            >
              {createPromoMutation.isPending
                ? "Creating..."
                : "Create Promotion"}
            </Button>
          </CardContent>
        </Card>

        <Card className="casino-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Active Promotions (
              {promotionsQuery.data?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {promotionsQuery.isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : promotionsQuery.data?.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No promotions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promotionsQuery.data?.map((promo) => (
                  <div
                    key={promo.title}
                    className="p-4 rounded-lg bg-secondary/40 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {promo.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {promo.description}
                        </p>
                      </div>
                      <Badge className="bg-primary/15 text-primary border-primary/30 shrink-0">
                        <Coins className="w-3 h-3 mr-1" />
                        {Number(promo.bonusAmount).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
