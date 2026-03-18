/**
 * Universal Soul Engine
 * 地理データ、ロジックJSON、プレイヤー入力を合成して「魂（Identity）」を生成する
 */

// -----------------------------------------------------------------------
// FormulaParser
// 四則演算・括弧・max()/min() に対応した安全な数式パーサー
// Function() / eval() を一切使用しない
// -----------------------------------------------------------------------
class FormulaParser {
    constructor(expr) {
        this.expr = expr.replace(/\s+/g, ''); // 空白除去
        this.pos = 0;
    }

    parse() {
        const val = this.parseExpr();
        if (this.pos !== this.expr.length) {
            throw new Error('Unexpected token: ' + this.expr.slice(this.pos));
        }
        return val;
    }

    // 加減算（最低優先度）
    parseExpr() {
        let left = this.parseTerm();
        while (this.pos < this.expr.length &&
               (this.expr[this.pos] === '+' || this.expr[this.pos] === '-')) {
            const op = this.expr[this.pos++];
            const right = this.parseTerm();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    }

    // 乗除算
    parseTerm() {
        let left = this.parseFactor();
        while (this.pos < this.expr.length &&
               (this.expr[this.pos] === '*' || this.expr[this.pos] === '/')) {
            const op = this.expr[this.pos++];
            const right = this.parseFactor();
            left = op === '*' ? left * right : left / right;
        }
        return left;
    }

    // 単項・括弧・関数・数値
    parseFactor() {
        // 単項マイナス
        if (this.expr[this.pos] === '-') {
            this.pos++;
            return -this.parseFactor();
        }
        // 括弧
        if (this.expr[this.pos] === '(') {
            this.pos++;
            const v = this.parseExpr();
            this.pos++; // ')'
            return v;
        }
        // max(a, b)
        if (this.expr.startsWith('max(', this.pos)) {
            this.pos += 4;
            const a = this.parseExpr();
            this.pos++; // ','
            const b = this.parseExpr();
            this.pos++; // ')'
            return Math.max(a, b);
        }
        // min(a, b)
        if (this.expr.startsWith('min(', this.pos)) {
            this.pos += 4;
            const a = this.parseExpr();
            this.pos++; // ','
            const b = this.parseExpr();
            this.pos++; // ')'
            return Math.min(a, b);
        }
        // 数値リテラル
        const match = this.expr.slice(this.pos).match(/^[0-9]+(\.[0-9]+)?/);
        if (!match) {
            throw new Error('Parse error at: ' + this.expr.slice(this.pos));
        }
        this.pos += match[0].length;
        return parseFloat(match[0]);
    }
}

// -----------------------------------------------------------------------
// SoulEngine
// -----------------------------------------------------------------------
class SoulEngine {

    /**
     * キャラクターのスポーン（ミント）処理
     * @param {Object} geoPoint   - 土地JSON の特定ヘックス
     * @param {Object} logic      - ロジックJSON (sengoku-logic.json)
     * @param {Object} legacyData - 前代からの引き継ぎデータ（任意）
     * @param {Object} userPrefs  - ユーザーが選択した設定（gender等, 任意）
     */
    static spawn(geoPoint, logic, legacyData = null, userPrefs = {}) {
        const { attr } = geoPoint;

        // 1. 性別の決定
        const gender = this._determineAttribute(
            logic.generation_protocols.gender,
            userPrefs.gender
        );

        // 2. 年齢の決定
        const age = this._determineAge(
            logic.generation_protocols.spawn_age,
            userPrefs.age
        );

        // 3. 職業の抽選（地形補正を適用）
        const occupation = this._determineOccupation(
            attr,
            logic.spawn_probability,
            logic.province_overrides[attr.province]
        );

        // 4. 行動AP補正の計算（性別 × 職業 × 遺産）
        const apModifiers = this._calculateAPModifiers(
            gender,
            occupation,
            logic,
            legacyData
        );

        // 5. 最大APと学習効率（JSONの数式文字列から計算）
        const stats = this._calculateAgeStats(age, logic.trait_modifier_map.age_traits);

        // 6. ビジュアルキーの紐付け（疎結合アセット用）
        const visualKey = this._getVisualKey(gender, occupation, age, logic);

        return {
            timestamp: Date.now(),
            spawn_location: geoPoint.hex_id,
            identity: {
                gender,
                age,
                occupation,
                bloodline: legacyData ? legacyData.unlocked_bloodline : 'commoner'
            },
            capabilities: {
                ap_modifiers: apModifiers,
                max_ap: stats.max_ap,
                learning_rate: stats.learning_rate
            },
            visual_ref: visualKey,
            legacy_status: 'active'
        };
    }

    // 重み付き抽選
    static _weightedRandom(pool) {
        let total = pool.reduce((sum, item) => sum + (item.weight || item.base_weight), 0);
        let rand = Math.random() * total;
        for (const item of pool) {
            rand -= (item.weight || item.base_weight);
            if (rand <= 0) return item.id;
        }
        return pool[0].id;
    }

    // 性別等の属性決定
    static _determineAttribute(protocol, preferredValue) {
        if (protocol.input_method === 'choice' && preferredValue) return preferredValue;
        return this._weightedRandom(protocol.options);
    }

    // 年齢決定
    static _determineAge(protocol, preferredValue) {
        if (protocol.input_method === 'discrete' &&
            preferredValue &&
            protocol.available_formats.values.includes(preferredValue)) {
            return preferredValue;
        }
        const vals = protocol.available_formats.values;
        return vals[Math.floor(Math.random() * vals.length)];
    }

    // 職業決定ロジック
    static _determineOccupation(attr, prob, provinceOverride) {
        const pool = JSON.parse(JSON.stringify(prob.occupation_pool)); // ディープコピー

        // 地形補正の適用
        Object.values(prob.terrain_modifiers).forEach(mod => {
            let match = true;
            if (mod.condition.terrain_type !== undefined &&
                mod.condition.terrain_type !== attr.terrain_type) match = false;
            if (mod.condition.elevation_m) {
                if (mod.condition.elevation_m.lt &&
                    attr.elevation_m >= mod.condition.elevation_m.lt) match = false;
            }
            if (match) {
                pool.forEach(occ => {
                    if (mod.targets.includes(occ.id)) occ.base_weight *= mod.mul;
                });
            }
        });

        // 地域（国）補正の適用
        if (provinceOverride && provinceOverride.samurai_spawn_bonus) {
            const samurai = pool.find(o => o.id === 'samurai');
            if (samurai) samurai.base_weight *= provinceOverride.samurai_spawn_bonus;
        }

        return this._weightedRandom(pool);
    }

    // AP補正計算
    static _calculateAPModifiers(gender, occupation, logic, legacy) {
        const genderBase = logic.trait_modifier_map.gender_traits[gender].ap_mult;
        const occBase = logic.occupation_ap_modifiers[occupation];

        const combined = {};
        const allActions = new Set([...Object.keys(genderBase), ...Object.keys(occBase)]);

        allActions.forEach(action => {
            const gMul = genderBase[action] || 1.0;
            const oMul = occBase[action] || 1.0;
            let finalMul = gMul * oMul;
            if (legacy && legacy.inheritance_ap_bonus) {
                finalMul *= (1.0 - legacy.inheritance_ap_bonus);
            }
            combined[action] = parseFloat(finalMul.toFixed(2));
        });

        return combined;
    }

    // 年齢によるステータス計算（JSONの数式文字列を FormulaParser で評価）
    static _calculateAgeStats(age, traits) {
        const max_ap = this._evalFormula(traits.ap_max_formula, { age });
        const learning_rate = this._evalFormula(traits.learning_rate_formula, { age });
        return { max_ap, learning_rate };
    }

    /**
     * 数式文字列を安全に評価する
     * @param {string} formula - 数式文字列（例: "100 + (age * 2)"）
     * @param {Object} vars    - 変数マップ（例: { age: 13 }）
     */
    static _evalFormula(formula, vars) {
        let expr = formula;
        // \b は数字の隣では機能しないため lookahead/lookbehind で境界を判定する
        for (const [key, val] of Object.entries(vars)) {
            expr = expr.split(
                new RegExp('(?<![a-zA-Z0-9_])' + key + '(?![a-zA-Z0-9_])')
            ).join(String(val));
        }
        return new FormulaParser(expr).parse();
    }

    // ビジュアルキー生成（例: "m_samurai_13"）
    static _getVisualKey(gender, occupation, age, logic) {
        const genderKey = logic.trait_modifier_map.gender_traits[gender].visual_key;
        return `${genderKey}_${occupation}_${age}`;
    }
}

export default SoulEngine;
