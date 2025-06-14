// アプリケーションのメインクラス
class ShibuMeshiApp {
    constructor() {
        this.form = document.getElementById('mood-form');
        this.textArea = document.getElementById('mood-text');
        this.submitBtn = document.getElementById('submit-btn');
        this.loadingEl = document.getElementById('loading');
        this.resultsSection = document.getElementById('results-section');
        this.restaurantsList = document.getElementById('restaurants-list');
        this.analysisSummary = document.getElementById('analysis-summary');
        this.searchAgainBtn = document.getElementById('search-again-btn');
        
        this.initEventListeners();
        this.loadingSteps = [
            { id: 'step-1', text: '📝 気分を理解しています' },
            { id: 'step-2', text: '🔍 お店を検索しています' },
            { id: 'step-3', text: '💬 口コミを分析しています' },
            { id: 'step-4', text: '⭐ おすすめを選んでいます' }
        ];
    }

    initEventListeners() {
        // フォーム送信
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // クイック選択ボタン
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickOption(btn);
            });
        });

        // もう一度探すボタン
        this.searchAgainBtn.addEventListener('click', () => {
            this.resetToSearch();
        });
    }

    handleQuickOption(btn) {
        const text = btn.dataset.text;
        this.textArea.value = text;
        
        // 選択状態を切り替え
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    async handleSearch() {
        const text = this.textArea.value.trim();
        
        if (!text) {
            alert('気分を入力してください');
            return;
        }

        try {
            this.showLoading();
            
            // ステップ1: 気分解析
            await this.updateLoadingStep(0);
            const analysisResult = await this.analyzeText(text);
            
            // ステップ2: お店検索
            await this.updateLoadingStep(1);
            const restaurants = await this.searchRestaurants(analysisResult);
            
            // ステップ3: 口コミ分析
            await this.updateLoadingStep(2);
            const analyzedRestaurants = await this.analyzeRestaurants(restaurants, analysisResult);
            
            // ステップ4: 結果表示
            await this.updateLoadingStep(3);
            await this.delay(1000); // 最後のステップを少し長めに
            
            this.showResults(analyzedRestaurants, analysisResult);
            
        } catch (error) {
            console.error('検索エラー:', error);
            alert('検索中にエラーが発生しました。もう一度お試しください。');
            this.hideLoading();
        }
    }

    async analyzeText(text) {
        try {
            // Netlify Functions用の絶対パス
            const apiUrl = window.location.hostname === 'localhost' 
                ? '/api/analyze' 
                : '/.netlify/functions/analyze';
                
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.analysis;
        } catch (error) {
            console.error('API解析エラー:', error);
            console.log('フォールバック解析を使用:', text);
            
            // フォールバック: 簡単なキーワードマッチング
            return this.fallbackAnalysis(text);
        }
    }

    fallbackAnalysis(text) {
        // 簡単なキーワードマッチングによるフォールバック
        const keywords = {
            hot: ['温かい', 'あったかい', 'ホット'],
            light: ['軽め', 'あっさり', 'さっぱり'],
            heavy: ['がっつり', 'ボリューム', 'たくさん'],
            japanese: ['和食', '寿司', 'そば', 'うどん'],
            chinese: ['中華', 'ラーメン', '餃子'],
            cafe: ['カフェ', 'コーヒー', 'スイーツ']
        };

        const desired = [];
        const genres = [];

        Object.entries(keywords).forEach(([category, words]) => {
            words.forEach(word => {
                if (text.includes(word)) {
                    if (['japanese', 'chinese', 'cafe'].includes(category)) {
                        genres.push({ category, confidence: 0.8 });
                    } else {
                        desired.push({ keyword: word, category, weight: 1.0 });
                    }
                }
            });
        });

        return {
            desired_keywords: desired,
            avoid_keywords: [],
            suggested_genres: genres,
            appetite_level: text.includes('軽め') ? 'light' : 
                           text.includes('がっつり') ? 'heavy' : 'normal',
            time_of_day: this.getCurrentTimeOfDay(),
            mood: [],
            location_hint: '',
            confidence_score: 0.6
        };
    }

    getCurrentTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 15) return 'lunch';
        if (hour >= 15 && hour < 22) return 'dinner';
        return 'other';
    }

    async searchRestaurants(analysis) {
        // モックデータ（実際の実装では食べログAPIやスクレイピングを使用）
        const mockRestaurants = [
            {
                id: 1,
                name: 'おいしい和食処 さくら',
                genre: '和食',
                rating: 4.2,
                distance: '徒歩5分',
                priceRange: '¥2,000-3,000',
                url: 'https://tabelog.com/example1',
                reviews: [
                    { text: '温かいうどんが美味しくて、心がほっこりしました。優しい味で癒されます。', rating: 4.5 },
                    { text: '軽めのランチを探していましたが、ちょうど良い量でした。', rating: 4.0 },
                    { text: '雰囲気が良く、リラックスできる空間です。', rating: 4.3 },
                    { text: '新鮮な食材を使っていて、品質が高いです。', rating: 4.4 },
                    { text: '接客も丁寧で気持ちよく食事できました。', rating: 4.1 }
                ]
            },
            {
                id: 2,
                name: 'ラーメン横丁 龍王',
                genre: '中華・ラーメン',
                rating: 4.0,
                distance: '徒歩3分',
                priceRange: '¥1,000-1,500',
                url: 'https://tabelog.com/example2',
                reviews: [
                    { text: 'アツアツのラーメンが最高！寒い日にぴったりです。', rating: 4.2 },
                    { text: 'ボリューム満点で、がっつり食べたい時におすすめ。', rating: 4.1 },
                    { text: 'スープが濃厚で美味しい。また来たいです。', rating: 3.9 },
                    { text: 'コスパが良くて満足度が高い。', rating: 4.0 },
                    { text: '深夜まで営業していて便利です。', rating: 3.8 }
                ]
            },
            {
                id: 3,
                name: 'カフェ・ド・パリ',
                genre: 'カフェ・洋食',
                rating: 4.3,
                distance: '徒歩7分',
                priceRange: '¥1,500-2,500',
                url: 'https://tabelog.com/example3',
                reviews: [
                    { text: 'おしゃれな雰囲気で、女性に人気のカフェです。', rating: 4.4 },
                    { text: 'スイーツが絶品！特にケーキがおすすめ。', rating: 4.5 },
                    { text: 'ゆっくり過ごせる空間で、読書にも最適。', rating: 4.2 },
                    { text: 'コーヒーの味が本格的で満足。', rating: 4.3 },
                    { text: 'ちょっと高めですが、価値があります。', rating: 4.0 }
                ]
            }
        ];

        // 解析結果に基づいてフィルタリング
        return mockRestaurants.filter(restaurant => {
            // ジャンルマッチング
            if (analysis.suggested_genres.length > 0) {
                const genreMatch = analysis.suggested_genres.some(g => 
                    restaurant.genre.includes(g.category === 'japanese' ? '和食' :
                                            g.category === 'chinese' ? '中華' :
                                            g.category === 'cafe' ? 'カフェ' : g.category)
                );
                return genreMatch;
            }
            return true;
        });
    }

    async analyzeRestaurants(restaurants, userPreferences) {
        // 簡単なスコアリングロジック（インライン実装）
        return restaurants.map(restaurant => {
            let score = restaurant.rating || 3.0; // 基本評価
            let reasons = [];
            
            // ユーザーの希望キーワードとマッチング
            if (userPreferences.desired_keywords.length > 0) {
                userPreferences.desired_keywords.forEach(desired => {
                    restaurant.reviews.forEach(review => {
                        if (review.text.includes(desired.keyword)) {
                            score += 0.5 * desired.weight;
                            reasons.push(`${desired.keyword}にマッチ`);
                        }
                    });
                });
            }

            // 気分とのマッチング
            if (userPreferences.mood.length > 0) {
                const moodKeywords = {
                    comfort: ['癒し', 'ほっこり', '安らぐ', 'リラックス'],
                    energy: ['元気', 'パワー', '活力'],
                    celebration: ['特別', '贅沢', 'ご褒美']
                };

                userPreferences.mood.forEach(mood => {
                    const keywords = moodKeywords[mood.mood] || [];
                    restaurant.reviews.forEach(review => {
                        keywords.forEach(keyword => {
                            if (review.text.includes(keyword)) {
                                score += 0.3;
                                reasons.push('今の気分にぴったり');
                            }
                        });
                    });
                });
            }

            // ポジティブキーワードのチェック
            const positiveKeywords = ['美味しい', 'おいしい', '最高', '素晴らしい', 'コスパ'];
            let positiveCount = 0;
            restaurant.reviews.forEach(review => {
                positiveKeywords.forEach(keyword => {
                    if (review.text.includes(keyword)) {
                        positiveCount++;
                    }
                });
            });

            if (positiveCount >= 2) {
                score += 0.5;
                reasons.push('高評価の口コミが多い');
            }

            // 理由が少ない場合のデフォルト
            if (reasons.length === 0) {
                reasons.push('総合評価から判断');
            }

            return {
                ...restaurant,
                score: Math.max(0, Math.min(10, score)), // 0-10に正規化
                matchReason: reasons.slice(0, 2).join('、'), // 最大2つの理由
                confidence: 0.7
            };
        }).sort((a, b) => b.score - a.score);
    }

    showLoading() {
        this.form.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.loadingEl.style.display = 'block';
        this.submitBtn.disabled = true;
    }

    hideLoading() {
        this.loadingEl.style.display = 'none';
        this.submitBtn.disabled = false;
    }

    async updateLoadingStep(stepIndex) {
        // 前のステップを完了状態に
        if (stepIndex > 0) {
            const prevStep = document.getElementById(this.loadingSteps[stepIndex - 1].id);
            prevStep.classList.remove('active');
            prevStep.classList.add('completed');
        }

        // 現在のステップをアクティブに
        const currentStep = document.getElementById(this.loadingSteps[stepIndex].id);
        currentStep.classList.add('active');

        // 少し待つ
        await this.delay(800);
    }

    showResults(restaurants, analysis) {
        this.hideLoading();
        
        // 解析サマリーを表示
        this.analysisSummary.textContent = this.generateAnalysisSummary(analysis);
        
        // レストランリストをクリア
        this.restaurantsList.innerHTML = '';
        
        // 上位3件を表示
        const topRestaurants = restaurants.slice(0, 3);
        topRestaurants.forEach(restaurant => {
            const card = this.createRestaurantCard(restaurant);
            this.restaurantsList.appendChild(card);
        });
        
        // 結果セクションを表示
        this.resultsSection.style.display = 'block';
        
        // 結果にスクロール
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateAnalysisSummary(analysis) {
        let summary = '';
        
        if (analysis.time_of_day !== 'other') {
            const timeMap = {
                morning: '朝',
                lunch: '昼',
                dinner: '夜'
            };
            summary += `${timeMap[analysis.time_of_day]}の`;
        }
        
        if (analysis.appetite_level === 'light') {
            summary += '軽めの';
        } else if (analysis.appetite_level === 'heavy') {
            summary += 'がっつりとした';
        }
        
        if (analysis.desired_keywords.length > 0) {
            const topKeyword = analysis.desired_keywords[0];
            summary += `${topKeyword.keyword}`;
        }
        
        if (analysis.suggested_genres.length > 0) {
            const topGenre = analysis.suggested_genres[0];
            summary += `${topGenre.category === 'japanese' ? '和食' : 
                       topGenre.category === 'chinese' ? '中華' :
                       topGenre.category === 'western' ? '洋食' : 
                       topGenre.category}系`;
        }
        
        summary += 'のお店をお探しですね。あなたの気分にぴったりのお店を見つけました！';
        
        return summary;
    }

    createRestaurantCard(restaurant) {
        const template = document.getElementById('restaurant-card-template');
        const card = template.content.cloneNode(true);
        
        // 基本情報
        card.querySelector('.restaurant-name').textContent = restaurant.name;
        card.querySelector('.stars').textContent = '★'.repeat(Math.floor(restaurant.rating));
        card.querySelector('.score').textContent = restaurant.rating.toFixed(1);
        
        // 詳細情報
        card.querySelector('.genre').textContent = restaurant.genre;
        card.querySelector('.distance').textContent = restaurant.distance;
        card.querySelector('.price-range').textContent = restaurant.priceRange;
        
        // マッチ理由
        card.querySelector('.reason-text').textContent = restaurant.matchReason;
        
        // リンク
        const detailsBtn = card.querySelector('.view-details-btn');
        detailsBtn.href = restaurant.url;
        
        // 保存ボタン
        const saveBtn = card.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => {
            this.saveRestaurant(restaurant);
        });
        
        return card;
    }

    saveRestaurant(restaurant) {
        // ローカルストレージに保存
        const saved = JSON.parse(localStorage.getItem('savedRestaurants') || '[]');
        
        if (!saved.find(r => r.id === restaurant.id)) {
            saved.push(restaurant);
            localStorage.setItem('savedRestaurants', JSON.stringify(saved));
            alert(`${restaurant.name} を保存しました！`);
        } else {
            alert('すでに保存済みです');
        }
    }

    resetToSearch() {
        this.resultsSection.style.display = 'none';
        this.form.style.display = 'block';
        this.textArea.value = '';
        
        // 選択状態をリセット
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // フォームにスクロール
        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new ShibuMeshiApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShibuMeshiApp;
} 