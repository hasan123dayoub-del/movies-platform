import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";

describe("actors who have died", () => {
  let admin = "";
  let id = 0;
  const actor = { birthday: "1979-04-04", nationality: "Australian" };

  beforeAll(async () => {
    admin = await adminToken();
  });
  afterAll(async () => {
    if (id) await api().delete(`/actors/${id}`).set(bearer(admin));
  });

  it("saves a date of death with the actor", async () => {
    const res = await api()
      .post("/actors")
      .set(bearer(admin))
      .send({ ...actor, name: `Death ${uniq()}`, deathDate: "2008-01-22" });
    expect(res.status).toBe(201);
    expect(res.body.deathDate).toBe("2008-01-22T00:00:00.000Z");
    id = res.body.id;
  });

  it("refuses a death before the birthday, also when only one date is edited", async () => {
    const created = await api()
      .post("/actors")
      .set(bearer(admin))
      .send({ ...actor, name: `Death ${uniq()}`, deathDate: "1970-01-01" });
    expect(created.status).toBe(400);
    expect(created.body.errors[0]).toEqual({ field: "deathDate", message: "Date of death can't be before the birthday" });

    // only the date of death sent: checked against the saved birthday
    const edited = await api().put(`/actors/${id}`).set(bearer(admin)).send({ deathDate: "1970-01-01" });
    expect(edited.status).toBe(400);
    expect(edited.body.errors[0].field).toBe("deathDate");
    // only the birthday sent: checked against the saved date of death
    const born = await api().put(`/actors/${id}`).set(bearer(admin)).send({ birthday: "2010-01-01" });
    expect(born.status).toBe(400);
  });

  it("refuses a date in the future or a wrong format, and null clears it", async () => {
    for (const [deathDate, message] of [
      ["2999-01-01", "Date of death can't be in the future"],
      ["22/01/2008", "Date of death must be a date like 2008-01-22"],
    ]) {
      const res = await api().put(`/actors/${id}`).set(bearer(admin)).send({ deathDate });
      expect(res.body.errors[0]).toEqual({ field: "deathDate", message });
    }
    const cleared = await api().put(`/actors/${id}`).set(bearer(admin)).send({ deathDate: null });
    expect(cleared.status).toBe(200);
    expect(cleared.body.deathDate).toBeNull();
  });

  it("the seed added the dates of death", async () => {
    const actors: { name: string; deathDate: string | null }[] = (await api().get("/actors")).body;
    expect(actors.find((a) => a.name === "Heath Ledger")?.deathDate).toBe("2008-01-22T00:00:00.000Z");
    expect(actors.find((a) => a.name === "Cillian Murphy")?.deathDate).toBeNull();
  });
});
